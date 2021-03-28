import { combineReducers, Reducer } from 'redux';

import { State as RootState } from 'app/types';
import { Scope } from 'app/services/api/oauth';

import {
    ErrorAction,
    CredentialsAction,
    AccountSwitcherAction,
    LoadingAction,
    ClientAction,
    OAuthAction,
    ScopesAction,
} from './actions';

export interface Credentials {
    login?: string | null; // By some reasons there is can be null value. Need to investigate.
    password?: string;
    rememberMe?: boolean;
    returnUrl?: string;
    isRelogin?: boolean;
    isTotpRequired?: boolean;
    isActivationRequired?: boolean;
}

type Error = Record<
    string,
    | string
    | {
          type: string;
          payload: Record<string, any>;
      }
> | null;

export interface Client {
    id: string;
    name: string;
    description: string;
}

export interface OAuthState {
    clientId: string;
    redirectUrl: string;
    responseType: string;
    description?: string;
    scope: string;
    prompt: string;
    loginHint: string;
    state: string;
    success?: boolean;
    code?: string;
    displayCode?: boolean;
    acceptRequired?: boolean;
}

type Scopes = Array<Scope>;

export interface State {
    credentials: Credentials;
    error: Error;
    isLoading: boolean;
    isSwitcherEnabled: boolean;
    client: Client | null;
    oauth: OAuthState | null;
    scopes: Scopes;
}

const error: Reducer<State['error'], ErrorAction> = (state = null, { type, payload }) => {
    if (type === 'auth:error') {
        return payload;
    }

    return state;
};

const credentials: Reducer<State['credentials'], CredentialsAction> = (state = {}, { type, payload }) => {
    if (type === 'auth:setCredentials') {
        if (payload) {
            return {
                ...payload,
            };
        }

        return {};
    }

    return state;
};

const isSwitcherEnabled: Reducer<State['isSwitcherEnabled'], AccountSwitcherAction> = (
    state = true,
    { type, payload },
) => {
    if (type === 'auth:setAccountSwitcher') {
        return payload;
    }

    return state;
};

const isLoading: Reducer<State['isLoading'], LoadingAction> = (state = false, { type, payload }) => {
    if (type === 'set_loading_state') {
        return payload;
    }

    return state;
};

const client: Reducer<State['client'], ClientAction> = (state = null, { type, payload }) => {
    if (type === 'set_client') {
        return payload;
    }

    return state;
};

const oauth: Reducer<State['oauth'], OAuthAction> = (state = null, action) => {
    switch (action.type) {
        case 'set_oauth':
            return action.payload;
        case 'set_oauth_result':
            return {
                ...(state as OAuthState),
                ...action.payload,
            };
        case 'require_permissions_accept':
            return {
                ...(state as OAuthState),
                acceptRequired: true,
            };
        default:
            return state;
    }
};

const scopes: Reducer<State['scopes'], ScopesAction> = (state = [], { type, payload }) => {
    if (type === 'set_scopes') {
        return payload;
    }

    return state;
};

export default combineReducers<State>({
    credentials,
    error,
    isLoading,
    isSwitcherEnabled,
    client,
    oauth,
    scopes,
});

export function getLogin(state: RootState | Pick<RootState, 'auth'>): string | null {
    return state.auth.credentials.login || null;
}

export function getCredentials(state: RootState): Credentials {
    return state.auth.credentials;
}
