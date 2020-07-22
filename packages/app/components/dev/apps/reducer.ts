import { OauthAppResponse } from 'app/services/api/oauth';

import { Action } from './actions';

export interface State {
    available: Array<OauthAppResponse>;
}

const defaults: State = {
    available: [],
};

export default function apps(state: State = defaults, action: Action): State {
    switch (action.type) {
        case 'apps:setAvailable':
            return {
                ...state,
                available: action.payload,
            };

        case 'apps:addApp': {
            const { payload } = action;
            const available = [...state.available];
            let index = available.findIndex((app) => app.clientId === payload.clientId);

            if (index === -1) {
                index = available.length;
            }

            available[index] = action.payload;

            return {
                ...state,
                available,
            };
        }

        case 'apps:deleteApp':
            return {
                ...state,
                available: state.available.filter((app) => app.clientId !== action.payload),
            };
    }

    return state;
}
