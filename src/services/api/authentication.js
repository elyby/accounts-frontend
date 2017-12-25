// @flow
import logger from 'services/logger';
import request, { InternalServerError } from 'services/request';
import accounts from 'services/api/accounts';

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
    logout(options: {
        token?: string
    } = {}) {
        return request.post('/api/authentication/logout', {}, {
            token: options.token
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
     * @param {object} options
     * @param {string} options.token
     * @param {string} options.refreshToken
     *
     * @return {Promise} - resolves with options.token or with a new token
     *                     if it was refreshed. As a side effect the response
     *                     will have a `user` field with current user data
     */
    validateToken({token, refreshToken}: {
        token: string,
        refreshToken: string
    }) {
        return new Promise((resolve) => {
            if (typeof token !== 'string') {
                throw new Error('token must be a string');
            }

            resolve();
        })
            .then(() => accounts.current({token}))
            .then((user) => ({token, refreshToken, user}))
            .catch((resp) => {
                if (resp instanceof InternalServerError) {
                    // delegate error recovering to the bsod middleware
                    return new Promise(() => {});
                }

                if (['Token expired', 'Incorrect token'].includes(resp.message)) {
                    return authentication.requestToken(refreshToken)
                        .then(({token}) =>
                            accounts.current({token})
                                .then((user) => ({token, refreshToken, user}))
                        )
                        .catch((error) => {
                            logger.error('Failed refreshing token during token validation', {
                                error
                            });

                            return Promise.reject(error);
                        });
                }

                const errors = resp.errors || {};
                if (errors.refresh_token !== 'error.refresh_token_not_exist') {
                    logger.error('Unexpected error during token validation', {
                        resp
                    });
                }

                return Promise.reject(resp);
            });
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
        ).then((resp: {access_token: string}) => ({
            token: resp.access_token
        }));
    }
};

export default authentication;
