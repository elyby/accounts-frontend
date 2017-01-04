import { routeActions } from 'react-router-redux';

import authentication from 'services/api/authentication';
import accounts from 'services/api/accounts';
import { updateUser, setGuest } from 'components/user/actions';
import { setLocale } from 'components/i18n/actions';
import logger from 'services/logger';

/**
 * @typedef {object} Account
 * @property {string} account.id
 * @property {string} account.username
 * @property {string} account.email
 * @property {string} account.token
 * @property {string} account.refreshToken
 */

/**
 * @param {Account|object} account
 * @param {string} account.token
 * @param {string} account.refreshToken
 *
 * @return {function}
 */
export function authenticate({token, refreshToken}) {
    return (dispatch) =>
        authentication.validateToken({token, refreshToken})
            .catch(() => {
                // TODO: log this case
                dispatch(logoutAll());

                return Promise.reject();
            })
            .then(({token, refreshToken}) =>
                accounts.current({token})
                    .then((user) => ({
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
            )
            .then(({user, account}) => {
                dispatch(add(account));
                dispatch(activate(account));
                dispatch(updateUser(user));

                // TODO: probably should be moved from here, because it is a side effect
                logger.setUser(user);

                if (!account.refreshToken) {
                    // mark user as stranger (user does not want us to remember his account)
                    sessionStorage.setItem(`stranger${account.id}`, 1);
                }

                return dispatch(setLocale(user.lang))
                    .then(() => account);
            });
}

/**
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

        dispatch(routeActions.push('/login'));

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
        const {accounts: {available}} = getState();

        const isStranger = ({refreshToken, id}) => !refreshToken && !sessionStorage.getItem(`stranger${id}`);

        const accountToReplace = available.filter((account) => !isStranger(account))[0];

        if (accountToReplace) {
            available.filter(isStranger)
                .forEach((account) => {
                    dispatch(remove(account));
                    authentication.logout(account);
                });

            return dispatch(authenticate(accountToReplace));
        }

        dispatch(logoutAll());

        return Promise.resolve();
    };
}

export const ADD = 'accounts:add';
/**
 * @api private
 *
 * @param {Account} account
 *
 * @return {object} - action definition
 */
export function add(account) {
    return {
        type: ADD,
        payload: account
    };
}

export const REMOVE = 'accounts:remove';
/**
 * @api private
 *
 * @param {Account} account
 *
 * @return {object} - action definition
 */
export function remove(account) {
    return {
        type: REMOVE,
        payload: account
    };
}

export const ACTIVATE = 'accounts:activate';
/**
 * @api private
 *
 * @param {Account} account
 *
 * @return {object} - action definition
 */
export function activate(account) {
    return {
        type: ACTIVATE,
        payload: account
    };
}

export const RESET = 'accounts:reset';
/**
 * @api private
 *
 * @return {object} - action definition
 */
export function reset() {
    return {
        type: RESET
    };
}

export const UPDATE_TOKEN = 'accounts:updateToken';
/**
 * @param {string} token
 *
 * @return {object} - action definition
 */
export function updateToken(token) {
    return {
        type: UPDATE_TOKEN,
        payload: token
    };
}
