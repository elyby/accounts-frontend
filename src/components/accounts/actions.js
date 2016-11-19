import authentication from 'services/api/authentication';
import accounts from 'services/api/accounts';
import { updateUser, logout } from 'components/user/actions';
import { setLocale } from 'components/i18n/actions';

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
            .then(({token, refreshToken}) =>
                accounts.current({token})
                    .then((user) => ({
                        user,
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
                dispatch(updateUser({
                    isGuest: false,
                    ...user
                }));

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

        return dispatch(logout());
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

export function logoutAll() {
    return (dispatch, getState) => {
        const {accounts: {available}} = getState();

        available.forEach((account) => authentication.logout(account));

        dispatch(reset());
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
