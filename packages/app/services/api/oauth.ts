import { ApplicationType } from 'app/components/dev/apps';
import { get, post, put, del, OAuthError, Resp } from 'app/services/request';

export type Scope = string;

export interface Client {
    id: string;
    name: string;
    description: string;
}

interface OauthCommonResponse {
    clientId: string;
    type: ApplicationType;
    name: string;
    websiteUrl: string;
    createdAt: number;
}

export interface OauthWebAppResponse extends OauthCommonResponse {
    clientSecret: string;
    countUsers: number;
    description: string;
    redirectUri: string;
}

export interface OauthDesktopAppResponse extends OauthCommonResponse {
    countUsers: number;
    description: string;
}

export interface OauthMinecraftServerResponse extends OauthCommonResponse {
    minecraftServerIp: string;
}

export type OauthAppResponse = OauthWebAppResponse | OauthDesktopAppResponse | OauthMinecraftServerResponse;

/**
 * The authorization request's query as is (client_id, redirect_uri, response_type, etc.).
 * The backend validates all of them.
 */
type AuthCodeFlowRequestData = Record<string, string>;

interface DeviceCodeFlowRequestData {
    user_code: string;
}

export type OauthRequestData = (AuthCodeFlowRequestData | DeviceCodeFlowRequestData) & {
    description?: string;
};

export interface OAuthValidateResponse {
    session: {
        scopes: Scope[];
    };
    client: Client;
}

interface FormPayloads {
    name?: string;
    description?: string;
    websiteUrl?: string;
    redirectUri?: string;
    minecraftServerIp?: string;
}

const api = {
    validate(oauthData: OauthRequestData) {
        // Rejects with OAuthError, which has the userMessage for the invalid OAuth params
        return get<OAuthValidateResponse>('/api/oauth2/v1/validate', oauthData);
    },

    complete(
        oauthData: OauthRequestData,
        params: { accept?: boolean } = {},
    ): Promise<{
        success: boolean;
        redirectUri?: string;
    }> {
        const data: Record<string, any> = {};

        if (typeof params.accept !== 'undefined') {
            data.accept = params.accept;
        }

        return post<{ success: boolean; redirectUri: string }>('/api/oauth2/v1/complete', data, { searchParams: oauthData })
            .catch((error): Resp<{ success: false; redirectUri?: string }> => {
                if (error instanceof OAuthError && error.error === 'access_denied') {
                    // user declined permissions
                    return {
                        success: false,
                        redirectUri: error.redirectUri,
                        response: error.response,
                    };
                }

                // UnauthorizedError, OAuthError 'accept_required' and the invalid OAuth params (see OAuthError.userMessage)
                // are handled by the callers
                throw error;
            });
    },

    create(type: string, formParams: FormPayloads) {
        return post<{ success: boolean; data: OauthAppResponse }>(`/api/v1/oauth2/${type}`, formParams);
    },

    update(clientId: string, formParams: FormPayloads) {
        return put<{ success: boolean; data: OauthAppResponse }>(`/api/v1/oauth2/${clientId}`, formParams);
    },

    getApp(clientId: string) {
        return get<OauthAppResponse>(`/api/v1/oauth2/${clientId}`);
    },

    getAppsByUser(userId: number): Promise<OauthAppResponse[]> {
        return get(`/api/v1/accounts/${userId}/oauth2/clients`);
    },

    reset(clientId: string, regenerateSecret: boolean = false) {
        return post<{ success: boolean; data: OauthAppResponse }>(
            `/api/v1/oauth2/${clientId}/reset${regenerateSecret ? '?regenerateSecret' : ''}`,
        );
    },

    delete(clientId: string) {
        return del<{ success: boolean }>(`/api/v1/oauth2/${clientId}`);
    },
};

if ('Cypress' in window) {
    (window as any).oauthApi = api;
}

export default api;
