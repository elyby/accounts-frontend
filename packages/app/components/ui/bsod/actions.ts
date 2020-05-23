import { Action as ReduxAction } from 'redux';

interface BSoDAction extends ReduxAction {
    type: 'BSOD';
}

export function bsod(): BSoDAction {
    return {
        type: 'BSOD',
    };
}

export type Action = BSoDAction;
