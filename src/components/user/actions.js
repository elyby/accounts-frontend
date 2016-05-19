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
    return (dispatch) => {
        dispatch(setUser({isGuest: true}));
        dispatch(changeLang());
        dispatch(routeActions.push('/login'));
    };
}

export function fetchUserData() {
    return (dispatch) =>
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
             */
            console.log(resp);
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


export function authenticate(token) {
    if (!token || token.split('.').length !== 3) {
        throw new Error('Invalid token');
    }

    return (dispatch) => {
        request.setAuthToken(token);
        return dispatch(fetchUserData());
    };
}
