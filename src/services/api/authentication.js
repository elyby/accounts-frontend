// @flow
import type { UserResponse } from 'services/api/accounts';
import logger from 'services/logger';
import request, { InternalServerError } from 'services/request';
import { getInfo as getInfoEndpoint } from 'services/api/accounts';

const authentication = {
    login({
        login,
        password,
        totp,
        rememberMe = false
    }: {
        login: string,
        password?: string,
        totp?: string,
        rememberMe: bool
    }) {
        return request.post(
            '/api/authentication/login',
            {login, password, totp, rememberMe},
            {token: null}
        );
    },

    /**
     * @param {object} options
     * @param {string} [options.token] - an optional token to overwrite headers
     *                                   in middleware and disable token auto-refresh
     *
     * @return {Promise}
     */
    logout(options: ?{
        token: string
    }) {
        return request.post('/api/authentication/logout', {}, {
            token: options && options.token
        });
    },

    forgotPassword({
        login,
        captcha
    }: {
        login: string,
        captcha: string
    }) {
        return request.post(
            '/api/authentication/forgot-password',
            {login, captcha},
            {token: null}
        );
    },

    recoverPassword({
        key,
        newPassword,
        newRePassword
    }: {
        key: string,
        newPassword: string,
        newRePassword: string
    }) {
        return request.post(
            '/api/authentication/recover-password',
            {key, newPassword, newRePassword},
            {token: null}
        );
    },

    /**
     * Resolves if token is valid
     *
     * @param {string} token
     * @param {string} refreshToken
     *
     * @return {Promise} - resolves with options.token or with a new token
     *                     if it was refreshed. As a side effect the response
     *                     will have a `user` field with current user data
     *
     */
    async validateToken(token: string, refreshToken: ?string): Promise<{
        token: string,
        refreshToken: ?string,
        user: UserResponse,
    }> {
        if (typeof token !== 'string') {
            throw new Error('token must be a string');
        }

        // TODO: decode token to extract information about user id

        let user: UserResponse;
        try {
            user = await getInfoEndpoint(0, { token });
        } catch (resp) {
            const { token } = await this.handleTokenError(resp, refreshToken);
            user = await getInfoEndpoint(0, { token }); // TODO: replace with recursive call
        }

        return {
            token,
            refreshToken,
            user,
        };
    },

    handleTokenError(resp: Error | { message: string }, refreshToken: ?string): Promise<{
        token: string,
    }> {
        if (resp instanceof InternalServerError) {
            // delegate error recovering to the bsod middleware
            return new Promise(() => {});
        }

        if (refreshToken) {
            if ([
                'Token expired',
                'Incorrect token',
                'You are requesting with an invalid credential.'
            ].includes(resp.message)) {
                return authentication.requestToken(refreshToken);
            }

            logger.error('Unexpected error during token validation', {
                resp
            });
        }

        return Promise.reject(resp);
    },

    /**
     * Request new access token using a refreshToken
     *
     * @param {string} refreshToken
     *
     * @return {Promise} - resolves to {token}
     */
    requestToken(refreshToken: string): Promise<{token: string}> {
        return request.post(
            '/api/authentication/refresh-token',
            {refresh_token: refreshToken}, // eslint-disable-line
            {token: null}
        )
            .then((resp: {access_token: string}) => ({
                token: resp.access_token
            }))
            .catch((resp) => {
                const errors = resp.errors || {};

                if (errors.refresh_token !== 'error.refresh_token_not_exist') {
                    logger.error('Failed refreshing token: unknown error', {
                        resp
                    });
                }

                return Promise.reject(resp);
            });
    }
};

export default authentication;
