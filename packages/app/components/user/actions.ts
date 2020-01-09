import {
  changeLang as changeLangEndpoint,
  acceptRules as acceptRulesEndpoint,
} from 'app/services/api/accounts';
import { setLocale } from 'app/components/i18n/actions';
import { ThunkAction } from 'app/reducers';

import { User } from './reducer';

export const UPDATE = 'USER_UPDATE';
/**
 * Merge data into user's state
 *
 * @param {object} payload
 * @returns {object} - action definition
 */
export function updateUser(payload: Partial<User>) {
  // Temp workaround
  return {
    type: UPDATE,
    payload,
  };
}

export const SET = 'USER_SET';
/**
 * Replace current user's state with a new one
 *
 * @param {User} payload
 * @returns {object} - action definition
 */
export function setUser(payload: Partial<User>) {
  return {
    type: SET,
    payload,
  };
}

export const CHANGE_LANG = 'USER_CHANGE_LANG';
export function changeLang(targetLang: string): ThunkAction<Promise<void>> {
  return async (dispatch, getState) =>
    dispatch(setLocale(targetLang)).then((lang: string) => {
      const { id, isGuest, lang: oldLang } = getState().user;

      if (oldLang === lang) {
        return;
      }

      if (!isGuest && id) {
        changeLangEndpoint(id, lang);
      }

      dispatch({
        type: CHANGE_LANG,
        payload: {
          lang,
        },
      });
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
      throw new Error(
        'user id is should be set at the moment when this action is called',
      );
    }

    return acceptRulesEndpoint(id).then(resp => {
      dispatch(
        updateUser({
          shouldAcceptRules: false,
        }),
      );

      return resp;
    });
  };
}
