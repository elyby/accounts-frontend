import request from 'services/request';

export default {
    register({
        email = '',
        username = '',
        password = '',
        rePassword = '',
        rulesAgreement = false,
        lang = ''
    }) {
        return request.post(
            '/api/signup',
            {email, username, password, rePassword, rulesAgreement, lang}
        );
    },

    activate({key = ''}) {
        return request.post(
            '/api/signup/confirm',
            {key}
        );
    },

    resendActivation({email = ''}) {
        return request.post(
            '/api/signup/repeat-message',
            {email}
        );
    }
};
