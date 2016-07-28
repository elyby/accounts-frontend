import request from 'services/request';

export default {
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

    refreshToken(refresh_token) {
        return request.post(
            '/api/authentication/refresh-token',
            {refresh_token}
        );
    }
};
