import { routeActions } from 'react-router-redux';

import request from 'services/request';
import accounts from 'services/api/accounts';
import { setLocale } from 'components/i18n/actions';

export const UPDATE = 'USER_UPDATE';
/**
 * @param  {string|Object} payload jwt token or user object
 * @return {Object} action definition
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
    return (dispatch, getState) => {
        dispatch(setUser({
            lang: getState().user.lang,
            isGuest: true
        }));
        dispatch(routeActions.push('/login'));
    };
}

export function fetchUserData() {
    return (dispatch, getState) =>
        accounts.current()
            .then((resp) => {
                dispatch(updateUser(resp));

                return dispatch(changeLang(resp.lang));
            })
            .catch((resp) => {
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
                    const {token} = getState().user;
                    if (resp.message === 'Token expired' && token) {
                        return dispatch(authenticate(token));
                    }

                    dispatch(logout());
                }
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


import authentication from 'services/api/authentication';
export function authenticate(token, refreshToken) { // TODO: this action, probably, belongs to components/auth
    const jwt = getJWTPayload(token);

    return (dispatch, getState) => {
        refreshToken = refreshToken || getState().user.refreshToken;

        if (jwt.exp < Date.now() / 1000) {
            return authentication.refreshToken(refreshToken)
                .then((resp) => dispatch(authenticate(resp.access_token)))
                .catch(() => dispatch(logout()));
        }

        request.setAuthToken(token);
        return dispatch(fetchUserData()).then((resp) => {
            dispatch(updateUser({
                isGuest: false,
                token,
                refreshToken
            }));
            return resp;
        });
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
