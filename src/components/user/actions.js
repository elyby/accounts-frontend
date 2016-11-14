import { routeActions } from 'react-router-redux';

import accounts from 'services/api/accounts';
import { reset as resetAccounts } from 'components/accounts/actions';
import authentication from 'services/api/authentication';
import { setLocale } from 'components/i18n/actions';

export const UPDATE = 'USER_UPDATE';
/**
 * Merge data into user's state
 *
 * @param {object} payload
 * @return {object} - action definition
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

            if (oldLang !== lang) {
                !isGuest && accounts.changeLang(lang);

                dispatch({
                    type: CHANGE_LANG,
                    payload: {
                        lang
                    }
                });
            }
        });
}

export const SET = 'USER_SET';
/**
 * Replace current user's state with a new one
 *
 * @param {User} payload
 * @return {object} - action definition
 */
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

                dispatch(resetAccounts());

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
                dispatch(updateUser({
                    isGuest: false,
                    ...resp
                }));

                return dispatch(changeLang(resp.lang));
            });
}

export function acceptRules() {
    return (dispatch) =>
        accounts.acceptRules().then((resp) => {
            dispatch(updateUser({
                shouldAcceptRules: false
            }));

            return resp;
        });
}
