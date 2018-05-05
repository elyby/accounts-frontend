// @flow
import type { OauthAppResponse } from 'services/api/oauth';
import type { Action } from './actions';

export type Apps = {
    +available: Array<OauthAppResponse>,
};

const defaults: Apps = {
    available: [],
};

export default function apps(
    state: Apps = defaults,
    action: Action
) {
    switch (action.type) {
        case 'apps:setAvailable':
            return {
                ...state,
                available: action.payload,
            };

        case 'apps:addApp': {
            const { payload } = action;
            const available: Array<OauthAppResponse> = [...state.available];
            let index = available.findIndex((app) => app.clientId === payload.clientId);

            if (index === -1) {
                index = available.length;
            }

            available[index] = action.payload;

            return {
                ...state,
                available
            };
        }

        case 'apps:deleteApp':
            return {
                ...state,
                available: state.available.filter((app) => app.clientId !== action.payload),
            };

        default:
            (action.type: empty);

            return state;
    }
}
