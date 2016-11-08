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
            {login, password, rememberMe}
        );
    },

    logout() {
        return request.post('/api/authentication/logout');
    },

    forgotPassword({
        login = ''
    }) {
        return request.post(
            '/api/authentication/forgot-password',
            {login}
        );
    },

    recoverPassword({
        key = '',
        newPassword = '',
        newRePassword = ''
    }) {
        return request.post(
            '/api/authentication/recover-password',
            {key, newPassword, newRePassword}
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
     *                     if it was refreshed
     */
    validateToken({token, refreshToken}) {
        return new Promise((resolve) => {
            if (typeof token !== 'string') {
                throw new Error('token must be a string');
            }

            if (typeof refreshToken !== 'string') {
                throw new Error('refreshToken must be a string');
            }

            resolve();
        })
        .then(() => accounts.current({token}))
        .then(() => ({token, refreshToken}))
        .catch((resp) => {
            if (resp.message === 'Token expired') {
                return authentication.requestToken(refreshToken)
                    .then(({token}) => ({token, refreshToken}));
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
            {refresh_token: refreshToken}
        ).then((resp) => ({
            token: resp.access_token
        }));
    }
};

export default authentication;
