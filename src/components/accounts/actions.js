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
 */
export function authenticate({token, refreshToken}) {
    return (dispatch) => {
        return authentication.validateToken({token, refreshToken})
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
    };
}

/**
 * @param {Account} account
 */
export function revoke(account) {
    return (dispatch, getState) => {
        dispatch(remove(account));

        if (getState().accounts.length) {
            return dispatch(authenticate(getState().accounts[0]));
        } else {
            return dispatch(logout());
        }
    };
}

export const ADD = 'accounts:add';
/**
 * @api private
 *
 * @param {Account} account
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
 */
export function activate(account) {
    return {
        type: ACTIVATE,
        payload: account
    };
}

export const UPDATE_TOKEN = 'accounts:updateToken';
/**
 * @param {string} token
 */
export function updateToken(token) {
    return {
        type: UPDATE_TOKEN,
        payload: token
    };
}
