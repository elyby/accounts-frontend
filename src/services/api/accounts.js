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

    acceptRules() {
        return request.post('/api/accounts/accept-rules');
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
    },

    requestEmailChange({password = ''}) {
        return request.post(
            '/api/accounts/change-email/initialize',
            {password}
        );
    },

    setNewEmail({
        email = '',
        key = ''
    }) {
        return request.post(
            '/api/accounts/change-email/submit-new-email',
            {email, key}
        );
    },

    confirmNewEmail({key}) {
        return request.post(
            '/api/accounts/change-email/confirm-new-email',
            {key}
        );
    }
};
