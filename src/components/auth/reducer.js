import { combineReducers } from 'redux';

import { ERROR, SET_CLIENT, SET_OAUTH, SET_OAUTH_RESULT, SET_SCOPES, SET_LOADING_STATE } from './actions';

export default combineReducers({
    error,
    isLoading,
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


function isLoading(
    state = false,
    {type, payload = null}
) {
    switch (type) {
        case SET_LOADING_STATE:
            return !!payload;

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

        case SET_OAUTH_RESULT:
            return {
                ...state,
                success: payload.success,
                code: payload.code,
                displayCode: payload.displayCode
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
