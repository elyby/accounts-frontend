import {
    getInfo as getInfoEndpoint,
    changeLang as changeLangEndpoint,
    acceptRules as acceptRulesEndpoint,
} from 'services/api/accounts';
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

export const CHANGE_LANG = 'USER_CHANGE_LANG';
export function changeLang(lang) {
    return (dispatch, getState) => dispatch(setLocale(lang))
        .then((lang) => {
            const {user: {isGuest, lang: oldLang}} = getState();

            if (oldLang !== lang) {
                !isGuest && changeLangEndpoint(lang);

                dispatch({
                    type: CHANGE_LANG,
                    payload: {
                        lang
                    }
                });
            }
        });
}

export function setGuest() {
    return (dispatch, getState) => {
        dispatch(setUser({
            lang: getState().user.lang,
            isGuest: true
        }));
    };
}

export function fetchUserData() {
    return (dispatch) =>
        getInfoEndpoint(0)
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
        acceptRulesEndpoint().then((resp) => {
            dispatch(updateUser({
                shouldAcceptRules: false
            }));

            return resp;
        });
}
