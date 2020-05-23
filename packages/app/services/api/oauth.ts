import { ApplicationType } from 'app/components/dev/apps';
import request from 'app/services/request';

export type Scope =
  | 'minecraft_server_session'
  | 'offline_access'
  | 'account_info'
  | 'account_email';

export interface Client {
  id: string;
  name: string;
  description: string;
}

export interface OauthAppResponse {
  clientId: string;
  clientSecret: string;
  type: ApplicationType;
  name: string;
  websiteUrl: string;
  createdAt: number;
  // fields for 'application' type
  countUsers?: number;
  description?: string;
  redirectUri?: string;
  // fields for 'minecraft-server' type
  minecraftServerIp?: string;
}

interface OauthRequestData {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  description?: string;
  scope: string;
  prompt: string;
  login_hint?: string;
  state?: string;
}

export interface OauthData {
  clientId: string;
  redirectUrl: string;
  responseType: string;
  description?: string;
  scope: string;
  // TODO: why prompt is not nullable?
  prompt: string; // comma separated list of 'none' | 'consent' | 'select_account';
  loginHint?: string;
  state?: string;
}

export interface OAuthValidateResponse {
  session: {
    scopes: Scope[];
  };
  client: Client;
  oAuth: {}; // TODO: improve typing
}

interface FormPayloads {
  name?: string;
  description?: string;
  websiteUrl?: string;
  redirectUri?: string;
  minecraftServerIp?: string;
}

const api = {
  validate(oauthData: OauthData) {
    return request
      .get<OAuthValidateResponse>(
        '/api/oauth2/v1/validate',
        getOAuthRequest(oauthData),
      )
      .catch(handleOauthParamsValidation);
  },

  complete(
    oauthData: OauthData,
    params: { accept?: boolean } = {},
  ): Promise<{
    success: boolean;
    redirectUri: string;
  }> {
    const query = request.buildQuery(getOAuthRequest(oauthData));

    return request
      .post<{
        success: boolean;
        redirectUri: string;
      }>(
        `/api/oauth2/v1/complete?${query}`,
        typeof params.accept === 'undefined' ? {} : { accept: params.accept },
      )
      .catch((resp = {}) => {
        if (resp.statusCode === 401 && resp.error === 'access_denied') {
          // user declined permissions
          return {
            success: false,
            redirectUri: resp.redirectUri,
            originalResponse: resp.originalResponse,
          };
        }

        if (resp.status === 401 && resp.name === 'Unauthorized') {
          const error: { [key: string]: any } = new Error('Unauthorized');
          error.unauthorized = true;
          throw error;
        }

        if (resp.statusCode === 401 && resp.error === 'accept_required') {
          const error: { [key: string]: any } = new Error(
            'Permissions accept required',
          );
          error.acceptRequired = true;
          throw error;
        }

        return handleOauthParamsValidation(resp);
      });
  },

  create(type: string, formParams: FormPayloads) {
    return request.post<{ success: boolean; data: OauthAppResponse }>(
      `/api/v1/oauth2/${type}`,
      formParams,
    );
  },

  update(clientId: string, formParams: FormPayloads) {
    return request.put<{ success: boolean; data: OauthAppResponse }>(
      `/api/v1/oauth2/${clientId}`,
      formParams,
    );
  },

  getApp(clientId: string) {
    return request.get<OauthAppResponse>(`/api/v1/oauth2/${clientId}`);
  },

  getAppsByUser(userId: number): Promise<OauthAppResponse[]> {
    return request.get(`/api/v1/accounts/${userId}/oauth2/clients`);
  },

  reset(clientId: string, regenerateSecret: boolean = false) {
    return request.post<{ success: boolean; data: OauthAppResponse }>(
      `/api/v1/oauth2/${clientId}/reset${
        regenerateSecret ? '?regenerateSecret' : ''
      }`,
    );
  },

  delete(clientId: string) {
    return request.delete<{ success: boolean }>(`/api/v1/oauth2/${clientId}`);
  },
};

if ('Cypress' in window) {
  (window as any).oauthApi = api;
}

export default api;

/**
 * @param {object} oauthData
 * @param {string} oauthData.clientId
 * @param {string} oauthData.redirectUrl
 * @param {string} oauthData.responseType
 * @param {string} oauthData.description
 * @param {string} oauthData.scope
 * @param {string} oauthData.state
 *
 * @returns {object}
 */
function getOAuthRequest(oauthData: OauthData): OauthRequestData {
  return {
    client_id: oauthData.clientId,
    redirect_uri: oauthData.redirectUrl,
    response_type: oauthData.responseType,
    description: oauthData.description,
    scope: oauthData.scope,
    prompt: oauthData.prompt,
    login_hint: oauthData.loginHint,
    state: oauthData.state,
  };
}

function handleOauthParamsValidation(
  resp:
    | { [key: string]: any }
    | {
        statusCode: number;
        success: false;
        error:
          | 'invalid_request'
          | 'unsupported_response_type'
          | 'invalid_scope'
          | 'invalid_client';
        parameter: string;
      } = {},
) {
  let userMessage: string | null = null;

  if (resp.statusCode === 400 && resp.error === 'invalid_request') {
    userMessage = `Invalid request (${resp.parameter} required).`;
  } else if (
    resp.statusCode === 400 &&
    resp.error === 'unsupported_response_type'
  ) {
    userMessage = `Invalid response type '${resp.parameter}'.`;
  } else if (resp.statusCode === 400 && resp.error === 'invalid_scope') {
    userMessage = `Invalid scope '${resp.parameter}'.`;
  } else if (resp.statusCode === 401 && resp.error === 'invalid_client') {
    userMessage = 'Can not find application you are trying to authorize.';
  }

  return userMessage
    ? Promise.reject({ ...resp, userMessage })
    : Promise.reject(resp);
}
