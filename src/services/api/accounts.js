// @flow
import request from 'services/request';

type UserResponse = {
    elyProfileLink: string,
    email: string,
    hasMojangUsernameCollision: bool,
    id: number,
    isActive: bool,
    isOtpEnabled: bool,
    lang: string,
    passwordChangedAt: number, // timestamp
    registeredAt: number, // timestamp
    shouldAcceptRules: bool,
    username: string,
    uuid: string,
};

export default {
    /**
     * @param {object} options
     * @param {object} [options.token] - an optional token to overwrite headers
     *                                   in middleware and disable token auto-refresh
     *
     * @return {Promise<UserResponse>}
     */
    current(options: { token?: ?string } = {}): Promise<UserResponse> {
        return request.get('/api/accounts/current', {}, {
            token: options.token
        });
    },

    changePassword({
        password = '',
        newPassword = '',
        newRePassword = '',
        logoutAll = true
    }: {
        password?: string,
        newPassword?: string,
        newRePassword?: string,
        logoutAll?: bool,
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
    }: {
        username?: string,
        password?: string,
    }) {
        return request.post(
            '/api/accounts/change-username',
            {username, password}
        );
    },

    changeLang(lang: string) {
        return request.post(
            '/api/accounts/change-lang',
            {lang}
        );
    },

    requestEmailChange({password = ''}: { password?: string }) {
        return request.post(
            '/api/accounts/change-email/initialize',
            {password}
        );
    },

    setNewEmail({
        email = '',
        key = ''
    }: {
        email?: string,
        key?: string,
    }) {
        return request.post(
            '/api/accounts/change-email/submit-new-email',
            {email, key}
        );
    },

    confirmNewEmail({key}: { key: string }) {
        return request.post(
            '/api/accounts/change-email/confirm-new-email',
            {key}
        );
    }
};
