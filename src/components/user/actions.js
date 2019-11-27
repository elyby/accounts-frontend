// @flow
import type { User, State } from './reducer';
import {
  getInfo as getInfoEndpoint,
  changeLang as changeLangEndpoint,
  acceptRules as acceptRulesEndpoint,
} from 'services/api/accounts';
import { setLocale } from 'components/i18n/actions';

type Dispatch = (action: Object) => Promise<*>;

export const UPDATE = 'USER_UPDATE';
/**
 * Merge data into user's state
 *
 * @param {object} payload
 * @returns {object} - action definition
 */
export function updateUser(payload: $Shape<User>) {
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
export function setUser(payload: $Shape<User>) {
  return {
    type: SET,
    payload,
  };
}

export const CHANGE_LANG = 'USER_CHANGE_LANG';
export function changeLang(lang: string) {
  return (dispatch: Dispatch, getState: () => State) =>
    dispatch(setLocale(lang)).then((lang: string) => {
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

export function setGuest() {
  return (dispatch: Dispatch, getState: () => Object) => {
    dispatch(
      setUser({
        lang: getState().user.lang,
        isGuest: true,
      }),
    );
  };
}

export function fetchUserData() {
  return async (dispatch: Dispatch, getState: () => State) => {
    // $FlowFixMe
    const resp = await getInfoEndpoint(getState().user.id);
    dispatch(
      updateUser({
        isGuest: false,
        ...resp,
      }),
    );
    dispatch(changeLang(resp.lang));

    return resp;
  };
}

export function acceptRules() {
  return (dispatch: Dispatch, getState: () => State) => {
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
