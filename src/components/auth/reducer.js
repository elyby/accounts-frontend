import { combineReducers } from 'redux';

import { ERROR, SET_CLIENT, SET_OAUTH, SET_SCOPES } from './actions';

export default combineReducers({
    error,
    client,
    oauth,
    scopes
});

function error(
    state = null,
    {type, payload = null, error = false}
) {
    switch (type) {
        case ERROR:
            if (!error) {
                throw new Error('Expected payload with error');
            }
            return payload;

        default:
            return state;
    }
}

function client(
    state = null,
    {type, payload = {}}
) {
    switch (type) {
        case SET_CLIENT:
            return {
                id: payload.id,
                name: payload.name,
                description: payload.description
            };

        default:
            return state;
    }
}

function oauth(
    state = null,
    {type, payload = {}}
) {
    switch (type) {
        case SET_OAUTH:
            return {
                clientId: payload.clientId,
                redirectUrl: payload.redirectUrl,
                responseType: payload.responseType,
                scope: payload.scope,
                state: payload.state
            };

        default:
            return state;
    }
}

function scopes(
    state = [],
    {type, payload = []}
) {
    switch (type) {
        case SET_SCOPES:
            return payload;

        default:
            return state;
    }
}
