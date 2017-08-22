import { combineReducers } from 'redux';

import {
    ERROR,
    SET_CLIENT,
    SET_OAUTH,
    SET_OAUTH_RESULT,
    SET_SCOPES,
    SET_LOADING_STATE,
    REQUIRE_PERMISSIONS_ACCEPT,
    SET_CREDENTIALS,
    SET_SWITCHER
} from './actions';

export default combineReducers({
    credentials,
    error,
    isLoading,
    isSwitcherEnabled,
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

function credentials(
    state = {},
    {type, payload}: {
        type: string,
        payload: ?{
            login?: string,
            password?: string,
            rememberMe?: bool,
            isTotpRequired?: bool
        }
    }
) {
    if (type === SET_CREDENTIALS) {
        if (payload
            && typeof payload === 'object'
        ) {
            return {
                ...payload
            };
        }

        return {};
    }

    return state;
}

function isSwitcherEnabled(
    state = true,
    {type, payload = false}
) {
    switch (type) {
        case SET_SWITCHER:
            if (typeof payload !== 'boolean') {
                throw new Error('Expected payload of boolean type');
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
                prompt: payload.prompt,
                loginHint: payload.loginHint,
                state: payload.state
            };

        case SET_OAUTH_RESULT:
            return {
                ...state,
                success: payload.success,
                code: payload.code,
                displayCode: payload.displayCode
            };

        case REQUIRE_PERMISSIONS_ACCEPT:
            return {
                ...state,
                acceptRequired: true
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

export function getLogin(state: Object): ?string {
    return state.auth.credentials.login || null;
}

export function getCredentials(state: Object): {
    login?: string,
    password?: string,
    rememberMe?: bool,
    isTotpRequired?: bool
} {
    return state.auth.credentials;
}
