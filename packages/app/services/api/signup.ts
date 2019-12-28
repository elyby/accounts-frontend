import request from 'app/services/request';

import { OAuthResponse } from './authentication';

export default {
  register({
    email = '',
    username = '',
    password = '',
    rePassword = '',
    rulesAgreement = false,
    lang = '',
    captcha = '',
  }) {
    return request.post(
      '/api/signup',
      { email, username, password, rePassword, rulesAgreement, lang, captcha },
      { token: null },
    );
  },

  activate({ key = '' }) {
    return request.post<OAuthResponse>(
      '/api/signup/confirm',
      { key },
      { token: null },
    );
  },

  resendActivation({ email = '', captcha }) {
    return request.post('/api/signup/repeat-message', { email, captcha });
  },
};