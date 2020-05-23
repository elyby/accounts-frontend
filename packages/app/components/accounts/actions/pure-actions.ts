import { Action as ReduxAction } from 'redux';
import { Account } from 'app/components/accounts/reducer';

interface AddAction extends ReduxAction {
    type: 'accounts:add';
    payload: Account;
}

export function add(account: Account): AddAction {
    return {
        type: 'accounts:add',
        payload: account,
    };
}

interface RemoveAction extends ReduxAction {
    type: 'accounts:remove';
    payload: Account;
}

export function remove(account: Account): RemoveAction {
    return {
        type: 'accounts:remove',
        payload: account,
    };
}

interface ActivateAction extends ReduxAction {
    type: 'accounts:activate';
    payload: Account;
}

export function activate(account: Account): ActivateAction {
    return {
        type: 'accounts:activate',
        payload: account,
    };
}

interface ResetAction extends ReduxAction {
    type: 'accounts:reset';
}

export function reset(): ResetAction {
    return {
        type: 'accounts:reset',
    };
}

interface UpdateTokenAction extends ReduxAction {
    type: 'accounts:updateToken';
    payload: string;
}

export function updateToken(token: string): UpdateTokenAction {
    return {
        type: 'accounts:updateToken',
        payload: token,
    };
}

export type Action = AddAction | RemoveAction | ActivateAction | ResetAction | UpdateTokenAction;
