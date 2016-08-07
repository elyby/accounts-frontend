import { routeActions } from 'react-router-redux';

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
    return (dispatch, getState) => {
        if (getState().user.token) {
            authentication.logout();
        }

        return new Promise((resolve) => {
            setTimeout(() => { // a tiny timeout to allow logout before user's token will be removed
                dispatch(setUser({
                    lang: getState().user.lang,
                    isGuest: true
                }));

                dispatch(routeActions.push('/login'));

                resolve();
            }, 0);
        });
    };
}

export function fetchUserData() {
    return (dispatch) =>
        accounts.current()
            .then((resp) => {
                dispatch(updateUser(resp));

                return dispatch(changeLang(resp.lang));
            });
}

export function acceptRules() {
    return (dispatch) =>
        accounts.acceptRules()
        .then((resp) => {
            dispatch(updateUser({
                shouldAcceptRules: false
            }));

            return resp;
        })
        ;
}

export function authenticate(token, refreshToken) { // TODO: this action, probably, belongs to components/auth
    return (dispatch, getState) => {
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

