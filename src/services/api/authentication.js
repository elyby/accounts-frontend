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

    refreshToken(refresh_token) {
        return request.post(
            '/api/authentication/refresh-token',
            {refresh_token}
        );
    }
};
