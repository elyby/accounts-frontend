import { Action as ReduxAction } from 'redux';

import { changeLang as changeLangEndpoint, acceptRules as acceptRulesEndpoint } from 'app/services/api/accounts';
import { setLocale } from 'app/components/i18n/actions';
import { ThunkAction } from 'app/reducers';

import { User } from './reducer';

interface UpdateAction extends ReduxAction {
    type: 'user:update';
    payload: Partial<User>;
}

/**
 * Merge data into user's state
 *
 * @param {object} payload
 * @returns {object} - action definition
 */
export function updateUser(payload: Partial<User>): UpdateAction {
    // Temp workaround
    return {
        type: 'user:update',
        payload,
    };
}

interface SetAction extends ReduxAction {
    type: 'user:set';
    payload: Partial<User>;
}

/**
 * Replace current user's state with a new one
 *
 * @param {User} payload
 * @returns {object} - action definition
 */
export function setUser(payload: Partial<User>): SetAction {
    return {
        type: 'user:set',
        payload,
    };
}

interface ChangeLangAction extends ReduxAction {
    type: 'user:changeLang';
    payload: string;
}

function changeLangPure(payload: string): ChangeLangAction {
    return {
        type: 'user:changeLang',
        payload,
    };
}

export function changeLang(targetLang: string): ThunkAction<Promise<void>> {
    return (dispatch, getState) =>
        dispatch(setLocale(targetLang)).then((lang: string) => {
            const { id, isGuest, lang: oldLang } = getState().user;

            if (oldLang === lang) {
                return;
            }

            if (!isGuest && id) {
                changeLangEndpoint(id, lang);
            }

            dispatch(changeLangPure(lang));
        });
}

export function setGuest(): ThunkAction<Promise<void>> {
    return async (dispatch, getState) => {
        dispatch(
            setUser({
                lang: getState().user.lang,
                isGuest: true,
            }),
        );
    };
}

export function acceptRules(): ThunkAction<Promise<{ success: boolean }>> {
    return (dispatch, getState) => {
        const { id } = getState().user;

        if (!id) {
            throw new Error('user id is should be set at the moment when this action is called');
        }

        return acceptRulesEndpoint(id).then((resp) => {
            dispatch(
                updateUser({
                    shouldAcceptRules: false,
                }),
            );

            return resp;
        });
    };
}

export type Action = UpdateAction | SetAction | ChangeLangAction;
