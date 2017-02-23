import request from 'services/request';
import accounts from 'services/api/accounts';

const authentication = {
    login({
        login = '',
        password = '',
        rememberMe = false
    }) {
        return request.post(
            '/api/authentication/login',
            {login, password, rememberMe},
            {token: null}
        );
    },

    /**
     * @param {object} options
     * @param {object} [options.token] - an optional token to overwrite headers
     *                                   in middleware and disable token auto-refresh
     *
     * @return {Promise}
     */
    logout(options = {}) {
        return request.post('/api/authentication/logout', {}, {
            token: options.token
        });
    },

    forgotPassword({
        login = ''
    }) {
        return request.post(
            '/api/authentication/forgot-password',
            {login},
            {token: null}
        );
    },

    recoverPassword({
        key = '',
        newPassword = '',
        newRePassword = ''
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
    validateToken({token, refreshToken}) {
        return new Promise((resolve) => {
            if (typeof token !== 'string') {
                throw new Error('token must be a string');
            }

            resolve();
        })
        .then(() => accounts.current({token}))
        .then((user) => ({token, refreshToken, user}))
        .catch((resp) => {
            if (resp.message === 'Token expired') {
                return authentication.requestToken(refreshToken)
                    .then(({token}) =>
                        accounts.current({token})
                            .then((user) => ({token, refreshToken, user}))
                    );
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
    requestToken(refreshToken) {
        return request.post(
            '/api/authentication/refresh-token',
            {refresh_token: refreshToken}, // eslint-disable-line
            {token: null}
        ).then((resp) => ({
            token: resp.access_token
        }));
    }
};

export default authentication;
