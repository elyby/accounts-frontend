// @flow
import type {
    Account,
    AddAction,
    RemoveAction,
    ActivateAction,
    UpdateTokenAction,
    ResetAction
} from '../reducer';

export const ADD = 'accounts:add';
/**
 * @api private
 *
 * @param {Account} account
 *
 * @return {object} - action definition
 */
export function add(account: Account): AddAction {
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
export function remove(account: Account): RemoveAction {
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
export function activate(account: Account): ActivateAction {
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
export function reset(): ResetAction {
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
export function updateToken(token: string): UpdateTokenAction {
    return {
        type: UPDATE_TOKEN,
        payload: token
    };
}
