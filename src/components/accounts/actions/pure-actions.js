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
