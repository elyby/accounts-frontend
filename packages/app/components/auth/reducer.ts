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
    /**
     * The logged in user must enter the password again (prompt=login)
     */
    isForcedLogin?: boolean;
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

export interface OauthAuthCodeFlowParams {
    query: Record<string, string>;
}

export interface OauthDeviceCodeFlowParams {
    userCode: string;
}

export interface OAuthState {
    params: OauthAuthCodeFlowParams | OauthDeviceCodeFlowParams;
    description?: string;
    /**
     * The supported values (space separated list):
     * - none - don't show any UI: when the authorization can't be completed silently, the error is returned
     *          to the client. Can't be combined with other values. Ignored, when there is no address to return the user
     *          to (e.g. the device code flow)
     * - login - ask the user to authenticate again, even when the account is already logged in
     * - consent - forcibly prompt user for permissions acceptance
     * - select_account - show the account switcher. It's shown by default anyway, but this value wins
     *                    over skip_account_selection
     * - skip_account_selection - our own extension: don't show the account switcher and use the active account
     */
    prompt?: string | Array<string>;
    /**
     * Allows to choose the account, which will be used for auth
     * The possible values: account id, email, username
     */
    loginHint?: string;
    /**
     * The address to return the user to the client when it must be done by frontend.
     * Might contain query part. Absent for the device code flow.
     */
    redirectUri?: string;
    /**
     * The user has entered the credentials during this request, so prompt=login is satisfied
     */
    isLoginPassed?: boolean;
    success?: boolean;
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
        case 'set_oauth_login_passed':
            // The user may log in outside of the oauth flow
            return state ? { ...state, isLoginPassed: true } : state;
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
