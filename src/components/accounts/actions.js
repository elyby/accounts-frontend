import { browserHistory } from 'react-router';

import { sessionStorage } from 'services/localStorage';
import authentication from 'services/api/authentication';
import { updateUser, setGuest } from 'components/user/actions';
import { setLocale } from 'components/i18n/actions';
import { setAccountSwitcher } from 'components/auth/actions';
import logger from 'services/logger';
import { InternalServerError } from 'services/request';

import {
    add,
    remove,
    activate,
    reset,
    updateToken
} from 'components/accounts/actions/pure-actions';

export { updateToken };

/**
 * @typedef {object} Account
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string} token
 * @property {string} refreshToken
 */

/**
 * @param {Account|object} account
 * @param {string} account.token
 * @param {string} account.refreshToken
 *
 * @return {function}
 */
export function authenticate({token, refreshToken}) {
    return (dispatch, getState) =>
        authentication.validateToken({token, refreshToken})
            .catch((resp = {}) => {
                if (resp instanceof InternalServerError) {
                    // delegate error recovering to the later logic
                    return Promise.reject(resp);
                }

                logger.warn('Error validating token during auth', {
                    resp
                });

                return dispatch(logoutAll())
                    .then(() => Promise.reject(resp));
            })
            .then(({token, refreshToken, user}) => ({
                user: {
                    isGuest: false,
                    ...user
                },
                account: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    token,
                    refreshToken
                }
            }))
            .then(({user, account}) => {
                const {auth} = getState();

                dispatch(add(account));
                dispatch(activate(account));
                dispatch(updateUser(user));

                // TODO: probably should be moved from here, because it is a side effect
                logger.setUser(user);

                if (!account.refreshToken) {
                    // mark user as stranger (user does not want us to remember his account)
                    sessionStorage.setItem(`stranger${account.id}`, 1);
                }

                if (auth && auth.oauth && auth.oauth.clientId) {
                    // if we authenticating during oauth, we disable account chooser
                    // because user probably has made his choise now
                    // this may happen, when user registers, logs in or uses account
                    // chooser panel during oauth
                    dispatch(setAccountSwitcher(false));
                }

                return dispatch(setLocale(user.lang))
                    .then(() => account);
            });
}

/**
 * Remove one account from current user's account list
 *
 * @param {Account} account
 *
 * @return {function}
 */
export function revoke(account) {
    return (dispatch, getState) => {
        const accountToReplace = getState().accounts.available.find(({id}) => id !== account.id);

        if (accountToReplace) {
            return dispatch(authenticate(accountToReplace))
                .then(() => {
                    authentication.logout(account);
                    dispatch(remove(account));
                });
        }

        return dispatch(logoutAll());
    };
}

export function logoutAll() {
    return (dispatch, getState) => {
        dispatch(setGuest());

        const {accounts: {available}} = getState();

        available.forEach((account) => authentication.logout(account));

        dispatch(reset());

        browserHistory.push('/login');

        return Promise.resolve();
    };
}

/**
 * Logouts accounts, that was marked as "do not remember me"
 *
 * We detecting foreign accounts by the absence of refreshToken. The account
 * won't be removed, until key `stranger${account.id}` is present in sessionStorage
 *
 * @return {function}
 */
export function logoutStrangers() {
    return (dispatch, getState) => {
        const {accounts: {available, active}} = getState();

        const isStranger = ({refreshToken, id}) => !refreshToken && !sessionStorage.getItem(`stranger${id}`);

        if (available.some(isStranger)) {
            const accountToReplace = available.filter((account) => !isStranger(account))[0];

            if (accountToReplace) {
                available.filter(isStranger)
                    .forEach((account) => {
                        dispatch(remove(account));
                        authentication.logout(account);
                    });

                if (isStranger(active)) {
                    return dispatch(authenticate(accountToReplace));
                }
            } else {
                return dispatch(logoutAll());
            }
        }

        return Promise.resolve();
    };
}
