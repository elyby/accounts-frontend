// @flow
import request from 'services/request';

export type UserResponse = {
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

export function getInfo(id: number, token?: string): Promise<UserResponse> {
    return request.get(`/api/v1/accounts/${id}`, {}, {
        token,
    });
}

export function changePassword(id: number, {
    password = '',
    newPassword = '',
    newRePassword = '',
    logoutAll = true,
}: {
    password?: string,
    newPassword?: string,
    newRePassword?: string,
    logoutAll?: bool,
}): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/password`, {
        password,
        newPassword,
        newRePassword,
        logoutAll,
    });
}

export function acceptRules(id: number): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/rules`);
}

export function changeUsername(id: number, username: ?string, password: ?string): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/username`, {
        username,
        password,
    });
}

export function changeLang(id: number, lang: string): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/language`, {
        lang,
    });
}

export function requestEmailChange(id: number, password: string): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/email-verification`, {
        password,
    });
}

export function setNewEmail(id: number, email: string, key: string): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/new-email-verification`, {
        email,
        key,
    });
}

export function confirmNewEmail(id: number, key: string): Promise<{ success: bool }> {
    return request.post(`/api/v1/accounts/${id}/email`, {
        key,
    });
}
