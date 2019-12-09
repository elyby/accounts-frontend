import { combineReducers } from 'redux';
import { RootState } from 'app/reducers';

import {
  ERROR,
  SET_CLIENT,
  SET_OAUTH,
  SET_OAUTH_RESULT,
  SET_SCOPES,
  SET_LOADING_STATE,
  REQUIRE_PERMISSIONS_ACCEPT,
  SET_CREDENTIALS,
  SET_SWITCHER,
} from './actions';

type Credentials = {
  login?: string;
  password?: string;
  rememberMe?: boolean;
  returnUrl?: string;
  isRelogin?: boolean;
  isTotpRequired?: boolean;
};

export interface Client {
  id: string;
  name: string;
  description: string;
}

interface OAuthState {
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
  displayCode?: string;
  acceptRequired?: boolean;
}

export interface State {
  credentials: Credentials;
  error:
    | null
    | string
    | {
        type: string;
        payload: { [key: string]: any };
      };
  isLoading: boolean;
  isSwitcherEnabled: boolean;
  client: Client | null;
  oauth: OAuthState | null;
  scopes: string[];
}

export default combineReducers<State>({
  credentials,
  error,
  isLoading,
  isSwitcherEnabled,
  client,
  oauth,
  scopes,
});

function error(
  state = null,
  { type, payload = null, error = false },
): State['error'] {
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
  {
    type,
    payload,
  }: {
    type: string;
    payload: Credentials | null;
  },
): State['credentials'] {
  if (type === SET_CREDENTIALS) {
    if (payload && typeof payload === 'object') {
      return {
        ...payload,
      };
    }

    return {};
  }

  return state;
}

function isSwitcherEnabled(
  state = true,
  { type, payload = false },
): State['isSwitcherEnabled'] {
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
  { type, payload = null },
): State['isLoading'] {
  switch (type) {
    case SET_LOADING_STATE:
      return !!payload;

    default:
      return state;
  }
}

function client(state = null, { type, payload }): State['client'] {
  switch (type) {
    case SET_CLIENT:
      return {
        id: payload.id,
        name: payload.name,
        description: payload.description,
      };

    default:
      return state;
  }
}

function oauth(
  state: State['oauth'] = null,
  { type, payload },
): State['oauth'] {
  switch (type) {
    case SET_OAUTH:
      return {
        clientId: payload.clientId,
        redirectUrl: payload.redirectUrl,
        responseType: payload.responseType,
        scope: payload.scope,
        prompt: payload.prompt,
        loginHint: payload.loginHint,
        state: payload.state,
      };

    case SET_OAUTH_RESULT:
      return {
        ...(state as OAuthState),
        success: payload.success,
        code: payload.code,
        displayCode: payload.displayCode,
      };

    case REQUIRE_PERMISSIONS_ACCEPT:
      return {
        ...(state as OAuthState),
        acceptRequired: true,
      };

    default:
      return state;
  }
}

function scopes(state = [], { type, payload = [] }): State['scopes'] {
  switch (type) {
    case SET_SCOPES:
      return payload;

    default:
      return state;
  }
}

export function getLogin(state: RootState): string | null {
  return state.auth.credentials.login || null;
}

export function getCredentials(state: RootState): Credentials {
  return state.auth.credentials;
}
