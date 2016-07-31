import { routeActions } from 'react-router-redux';

import request from 'services/request';
import captcha from 'services/captcha';
import accounts from 'services/api/accounts';
import authentication from 'services/api/authentication';
import { setLocale } from 'components/i18n/actions';

export const UPDATE = 'USER_UPDATE';
/**
 * @param  {string|object} payload jwt token or user object
 * @return {object} action definition
 */
export function updateUser(payload) {
    return {
        type: UPDATE,
        payload
    };
}

export const CHANGE_LANG = 'USER_CHANGE_LANG';
export function changeLang(lang) {
    return (dispatch, getState) => dispatch(setLocale(lang))
        .then((lang) => {
            const {user: {isGuest, lang: oldLang}} = getState();

            if (!isGuest && oldLang !== lang) {
                accounts.changeLang(lang);
            }

            // TODO: probably should be moved from here, because it is side effect
            captcha.setLang(lang);

            dispatch({
                type: CHANGE_LANG,
                payload: {
                    lang
                }
            });
        });
}

export const SET = 'USER_SET';
export function setUser(payload) {
    return {
        type: SET,
        payload
    };
}

export function logout() {
    return (dispatch, getState) =>
        authentication.logout().then(() => {
            dispatch(setUser({
                lang: getState().user.lang,
                isGuest: true
            }));
            dispatch(routeActions.push('/login'));
        });
}

export function fetchUserData() {
    return (dispatch) =>
        accounts.current()
            .then((resp) => {
                dispatch(updateUser(resp));

                return dispatch(changeLang(resp.lang));
            });
}

export function changePassword({
    password = '',
    newPassword = '',
    newRePassword = '',
    logoutAll = true,
}) {
    return (dispatch) =>
        accounts.changePassword(
            {password, newPassword, newRePassword, logoutAll}
        )
        .then((resp) => {
            dispatch(updateUser({
                shouldChangePassword: false
            }));

            return resp;
        })
        ;
}

let middlewareAdded = false;
export function authenticate(token, refreshToken) { // TODO: this action, probably, belongs to components/auth
    return (dispatch, getState) => {
        if (!middlewareAdded) {
            request.addMiddleware(tokenCheckMiddleware(dispatch, getState));
            request.addMiddleware(tokenApplyMiddleware(dispatch, getState));
            middlewareAdded = true;
        }

        refreshToken = refreshToken || getState().user.refreshToken;
        dispatch(updateUser({
            token,
            refreshToken
        }));

        return dispatch(fetchUserData()).then((resp) => {
            dispatch(updateUser({
                isGuest: false
            }));
            return resp;
        });
    };
}

function requestAccessToken(refreshToken, dispatch) {
    let promise;
    if (refreshToken) {
        promise = authentication.refreshToken(refreshToken);
    } else {
        promise = Promise.reject();
    }

    return promise
        .then((resp) => dispatch(updateUser({
            token: resp.access_token
        })))
        .catch(() => dispatch(logout()));
}

/**
 * Ensures, that all user's requests have fresh access token
 *
 * @param  {function} dispatch
 * @param  {function} getState
 *
 * @return {object} middleware
 */
function tokenCheckMiddleware(dispatch, getState) {
    return {
        before(data) {
            const {isGuest, refreshToken, token} = getState().user;
            const isRefreshTokenRequest = data.url.includes('refresh-token');

            if (isGuest || isRefreshTokenRequest || !token) {
                return data;
            }

            const SAFETY_FACTOR = 60; // ask new token earlier to overcome time dissynchronization problem
            const jwt = getJWTPayload(token);

            if (jwt.exp - SAFETY_FACTOR < Date.now() / 1000) {
                return requestAccessToken(refreshToken, dispatch).then(() => data);
            }

            return data;
        },

        catch(resp, restart) {
            /*
                {
                    "name": "Unauthorized",
                    "message": "You are requesting with an invalid credential.",
                    "code": 0,
                    "status": 401,
                    "type": "yii\\web\\UnauthorizedHttpException"
                }
                {
                    "name": "Unauthorized",
                    "message": "Token expired",
                    "code": 0,
                    "status": 401,
                    "type": "yii\\web\\UnauthorizedHttpException"
                }
            */
            if (resp && resp.status === 401) {
                const {refreshToken} = getState().user;
                if (resp.message === 'Token expired' && refreshToken) {
                    // request token and retry
                    return requestAccessToken(refreshToken, dispatch).then(restart);
                }

                dispatch(logout());
            }

            return Promise.reject(resp);
        }
    };
}

/**
 * Applies Bearer header for all requests
 *
 * @param  {function} dispatch
 * @param  {function} getState
 *
 * @return {object} middleware
 */
function tokenApplyMiddleware(dispatch, getState) {
    return {
        before(data) {
            const {token} = getState().user;

            if (token) {
                data.options.headers.Authorization = `Bearer ${token}`;
            }

            return data;
        }
    };
}

function getJWTPayload(jwt) {
    const parts = (jwt || '').split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid jwt token');
    }

    try {
        return JSON.parse(atob(parts[1]));
    } catch (err) {
        throw new Error('Can not decode jwt token');
    }
}
