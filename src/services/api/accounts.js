import request from 'services/request';

export default {
    current() {
        return request.get('/api/accounts/current');
    },

    changePassword({
        password = '',
        newPassword = '',
        newRePassword = '',
        logoutAll = true
    }) {
        return request.post(
            '/api/accounts/change-password',
            {password, newPassword, newRePassword, logoutAll}
        );
    },

    changeUsername({
        username = '',
        password = ''
    }) {
        return request.post(
            '/api/accounts/change-username',
            {username, password}
        );
    },

    changeLang(lang) {
        return request.post(
            '/api/accounts/change-lang',
            {lang}
        );
    }
};
