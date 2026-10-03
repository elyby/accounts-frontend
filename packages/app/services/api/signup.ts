import request, { Resp } from 'app/services/request';

import { OAuthResponse } from './authentication';

interface RegisterParams {
    email?: string;
    username?: string;
    password?: string;
    rePassword?: string;
    rulesAgreement?: boolean;
    lang?: string;
    captcha?: string;
    captchaType?: string;
}

export function register({
    email = '',
    username = '',
    password = '',
    rePassword = '',
    rulesAgreement = false,
    lang = '',
    captcha = '',
    captchaType = '',
}: RegisterParams): Promise<Resp<{ success: boolean }>> {
    return request.post(
        '/api/signup',
        { email, username, password, rePassword, rulesAgreement, lang, captcha, captchaType },
        { token: null },
    );
}

export function activate(key: string = ''): Promise<Resp<OAuthResponse>> {
    return request.post('/api/signup/confirm', { key }, { token: null });
}

export function resendActivation(email: string = '', captcha: string = '', captchaType: string = '') {
    return request.post('/api/signup/repeat-message', { email, captcha, captchaType });
}
