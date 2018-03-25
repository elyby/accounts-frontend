// @flow
import { SET_AVAILABLE } from './actions';
import type { OauthAppResponse } from 'services/api/oauth';

export type Apps = {
    +available: Array<OauthAppResponse>,
};

const defaults: Apps = {
    available: [],
};

export default function apps(
    state: Apps = defaults,
    {type, payload}: {type: string, payload: ?Object}
) {
    switch (type) {
        case SET_AVAILABLE:
            return {
                ...state,
                available: payload,
            };

        default:
            return state || {
                ...defaults
            };
    }
}
