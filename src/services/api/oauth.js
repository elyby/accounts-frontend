// @flow
/* eslint camelcase: off */
import type { Resp } from 'services/request';
import type { ApplicationType } from 'components/dev/apps';
import request from 'services/request';

export type Scope =
    | 'minecraft_server_session'
    | 'offline_access'
    | 'account_info'
    | 'account_email';

export type Client = {|
    id: string,
    name: string,
    description: string
|};

export type OauthAppResponse = {
    clientId: string,
    clientSecret: string,
    type: ApplicationType,
    name: string,
    websiteUrl: string,
    createdAt: number,
    // fields for 'application' type
    countUsers?: number,
    description?: string,
    redirectUri?: string,
    // fields for 'minecraft-server' type
    minecraftServerIp?: string,
};

type OauthRequestData = {
    client_id: string,
    redirect_uri: string,
    response_type: string,
    description: string,
    scope: Scope,
    prompt: string,
    login_hint?: string,
    state?: string,
};

export type OauthData = {
    clientId: string,
    redirectUrl: string,
    responseType: string,
    description: string,
    scope: Scope,
    prompt: 'none' | 'consent' | 'select_account',
    loginHint?: string,
    state?: string
};

type FormPayloads = {
    name?: string,
    description?: string,
    websiteUrl?: string,
    redirectUri?: string,
    minecraftServerIp?: string,
};

const api = {
    validate(oauthData: OauthData) {
        return request.get<{|
            session: {|
                scopes: Scope[],
            |},
            client: Client,
            oAuth: {||},
        |}>(
            '/api/oauth2/v1/validate',
            getOAuthRequest(oauthData)
        ).catch(handleOauthParamsValidation);
    },

    complete(oauthData: OauthData, params: {accept?: bool} = {}): Promise<{
        success: bool,
        redirectUri: string,
    }> {
        const query = request.buildQuery(getOAuthRequest(oauthData));

        return request.post<{
            success: bool,
            redirectUri: string,
        }>(
            `/api/oauth2/v1/complete?${query}`,
            typeof params.accept === 'undefined' ? {} : {accept: params.accept}
        ).catch((resp = {}) => {
            if (resp.statusCode === 401 && resp.error === 'access_denied') {
                // user declined permissions
                return {
                    success: false,
                    redirectUri: resp.redirectUri,
                    originalResponse: resp.originalResponse,
                };
            }

            if (resp.status === 401 && resp.name === 'Unauthorized') {
                const error: Object = new Error('Unauthorized');
                error.unauthorized = true;
                throw error;
            }

            if (resp.statusCode === 401 && resp.error === 'accept_required') {
                const error: Object = new Error('Permissions accept required');
                error.acceptRequired = true;
                throw error;
            }

            return handleOauthParamsValidation(resp);
        });
    },

    create(type: string, formParams: FormPayloads) {
        return request.post<{success: bool, data: OauthAppResponse}>(`/api/v1/oauth2/${type}`, formParams);
    },

    update(clientId: string, formParams: FormPayloads) {
        return request.put<{success: bool, data: OauthAppResponse}>(`/api/v1/oauth2/${clientId}`, formParams);
    },

    getApp(clientId: string) {
        return request.get<OauthAppResponse>(`/api/v1/oauth2/${clientId}`);
    },

    getAppsByUser(userId: number): Promise<OauthAppResponse[]> {
        return request.get(`/api/v1/accounts/${userId}/oauth2/clients`);
    },

    reset(clientId: string, regenerateSecret: bool = false) {
        return request.post<{success: bool, data: OauthAppResponse}>(`/api/v1/oauth2/${clientId}/reset${regenerateSecret ? '?regenerateSecret' : ''}`);
    },

    delete(clientId: string) {
        return request.delete<{success: bool}>(`/api/v1/oauth2/${clientId}`);
    },
};

if (window.Cypress) {
    window.oauthApi = api;
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
 * @return {object}
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
        state: oauthData.state
    };
}

function handleOauthParamsValidation(resp = {}) {
    if (resp.statusCode === 400 && resp.error === 'invalid_request') {
        resp.userMessage = `Invalid request (${resp.parameter} required).`;
    } else if (resp.statusCode === 400 && resp.error === 'unsupported_response_type') {
        resp.userMessage = `Invalid response type '${resp.parameter}'.`;
    } else if (resp.statusCode === 400 && resp.error === 'invalid_scope') {
        resp.userMessage = `Invalid scope '${resp.parameter}'.`;
    } else if (resp.statusCode === 401 && resp.error === 'invalid_client') {
        resp.userMessage = 'Can not find application you are trying to authorize.';
    }

    return Promise.reject(resp);
}
