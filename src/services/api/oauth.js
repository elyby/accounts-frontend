import request from 'services/request';

export default {
    validate(oauthData) {
        return request.get(
            '/api/oauth2/v1/validate',
            getOAuthRequest(oauthData)
        ).catch(handleOauthParamsValidation);
    },

    complete(oauthData, params = {}) {
        const query = request.buildQuery(getOAuthRequest(oauthData));

        return request.post(
            `/api/oauth2/v1/complete?${query}`,
            typeof params.accept === 'undefined' ? {} : {accept: params.accept}
        ).catch((resp = {}) => {
            if (resp.statusCode === 401 && resp.error === 'access_denied') {
                // user declined permissions
                return {
                    success: false,
                    redirectUri: resp.redirectUri
                };
            }

            if (resp.status === 401 && resp.name === 'Unauthorized') {
                const error = new Error('Unauthorized');
                error.unauthorized = true;
                throw error;
            }

            if (resp.statusCode === 401 && resp.error === 'accept_required') {
                const error = new Error('Permissions accept required');
                error.acceptRequired = true;
                throw error;
            }

            return handleOauthParamsValidation(resp);
        });
    }
};

function getOAuthRequest(oauthData) {
    return {
        client_id: oauthData.clientId,
        redirect_uri: oauthData.redirectUrl,
        response_type: oauthData.responseType,
        scope: oauthData.scope,
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
