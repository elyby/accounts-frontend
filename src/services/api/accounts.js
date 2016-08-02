import request from 'services/request';

export default {
    current() {
        return request.get('/api/accounts/current');
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
