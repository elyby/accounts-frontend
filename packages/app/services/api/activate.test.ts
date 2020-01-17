import expect from 'app/test/unexpected';
import sinon from 'sinon';

import request from 'app/services/request';
import * as signup from 'app/services/api/signup';

describe('signup api', () => {
  describe('#register', () => {
    const params = {
      email: 'email',
      username: 'username',
      password: 'password',
      rePassword: 'rePassword',
      rulesAgreement: false,
      lang: 'lang',
      captcha: 'captcha',
    };

    beforeEach(() => {
      sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
      (request.post as any).restore();
    });

    it('should post to register api', () => {
      signup.register(params);

      expect(request.post, 'to have a call satisfying', [
        '/api/signup',
        params,
        {},
      ]);
    });

    it('should disable any token', () => {
      signup.register(params);

      expect(request.post, 'to have a call satisfying', [
        '/api/signup',
        params,
        { token: null },
      ]);
    });
  });

  describe('#activate', () => {
    const key = 'key';

    beforeEach(() => {
      sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
      (request.post as any).restore();
    });

    it('should post to confirmation api', () => {
      signup.activate(key);

      expect(request.post, 'to have a call satisfying', [
        '/api/signup/confirm',
        { key },
        {},
      ]);
    });

    it('should disable any token', () => {
      signup.activate(key);

      expect(request.post, 'to have a call satisfying', [
        '/api/signup/confirm',
        { key },
        { token: null },
      ]);
    });
  });
});
