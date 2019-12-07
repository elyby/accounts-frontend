import {
  Account,
  AddAction,
  RemoveAction,
  ActivateAction,
  UpdateTokenAction,
  ResetAction,
} from '../reducer';

export const ADD = 'accounts:add';
/**
 * @private
 *
 * @param {Account} account
 *
 * @returns {object} - action definition
 */
export function add(account: Account): AddAction {
  return {
    type: ADD,
    payload: account,
  };
}

export const REMOVE = 'accounts:remove';
/**
 * @private
 *
 * @param {Account} account
 *
 * @returns {object} - action definition
 */
export function remove(account: Account): RemoveAction {
  return {
    type: REMOVE,
    payload: account,
  };
}

export const ACTIVATE = 'accounts:activate';
/**
 * @private
 *
 * @param {Account} account
 *
 * @returns {object} - action definition
 */
export function activate(account: Account): ActivateAction {
  return {
    type: ACTIVATE,
    payload: account,
  };
}

export const RESET = 'accounts:reset';
/**
 * @private
 *
 * @returns {object} - action definition
 */
export function reset(): ResetAction {
  return {
    type: RESET,
  };
}

export const UPDATE_TOKEN = 'accounts:updateToken';
/**
 * @param {string} token
 *
 * @returns {object} - action definition
 */
export function updateToken(token: string): UpdateTokenAction {
  return {
    type: UPDATE_TOKEN,
    payload: token,
  };
}
