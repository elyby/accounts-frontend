// @flow
import request from 'services/request';

let options;

export default {
  get(): Promise<{ reCaptchaPublicKey: string }> {
    if (options) {
      return Promise.resolve(options);
    }

    return request.get('/api/options', {}, { token: null }).then(resp => {
      options = resp;

      return resp;
    });
  },
};
