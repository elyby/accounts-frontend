// @flow
/* eslint camelcase: off */
import type { Resp } from 'services/request';
import request from 'services/request';

export type OauthAppResponse = {
    clientId: string,
    clientSecret: string,
    type: string,
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
    scope: string,
    prompt: string,
    login_hint?: string,
    state?: string,
};

export type OauthData = {
    clientId: string,
    redirectUrl: string,
    responseType: string,
    description: string,
    scope: string,
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

export default {
    validate(oauthData: OauthData) {
        return request.get(
            '/api/oauth2/v1/validate',
            getOAuthRequest(oauthData)
        ).catch(handleOauthParamsValidation);
    },

    complete(oauthData: OauthData, params: {accept?: bool} = {}): Promise<Resp<{
        success: bool,
        redirectUri: string,
    }>> {
        const query = request.buildQuery(getOAuthRequest(oauthData));

        return request.post(
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

    create(type: string, formParams: FormPayloads): Promise<Resp<{success: bool, data: OauthAppResponse}>> {
        return request.post(`/api/v1/oauth2/${type}`, formParams);
    },

    update(clientId: string, formParams: FormPayloads): Promise<Resp<{success: bool, data: OauthAppResponse}>> {
        return request.put(`/api/v1/oauth2/${clientId}`, formParams);
    },

    getApp(clientId: string): Promise<Resp<OauthAppResponse>> {
        return request.get(`/api/v1/oauth2/${clientId}`);
    },

    getAppsByUser(userId: number): Promise<Resp<Array<OauthAppResponse>>> {
        return request.get(`/api/v1/accounts/${userId}/oauth2/clients`);
    },

    reset(clientId: string, regenerateSecret: bool = false): Promise<Resp<{success: bool, data: OauthAppResponse}>> {
        return request.post(`/api/v1/oauth2/${clientId}/reset${regenerateSecret ? '?regenerateSecret' : ''}`);
    },

    delete(clientId: string): Promise<Resp<{success: bool}>> {
        return request.delete(`/api/v1/oauth2/${clientId}`);
    },
};
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
