/* eslint-disable @typescript-eslint/camelcase */
import expect from 'test/unexpected';
import sinon from 'sinon';

import request from 'services/request';
import * as authentication from 'services/api/authentication';
import * as accounts from 'services/api/accounts';

describe('authentication api', () => {
  let server;

  beforeEach(() => {
    server = sinon.createFakeServer({
      autoRespond: true,
    });

    ['get', 'post'].forEach(method => {
      server[method] = (url, resp = {}, status = 200, headers = {}) => {
        server.respondWith(method, url, [
          status,
          { 'Content-Type': 'application/json', ...headers },
          JSON.stringify(resp),
        ]);
      };
    });
  });

  afterEach(() => {
    server.restore();
  });

  describe('#login', () => {
    const params = {
      login: 'foo',
      password: 'secret',
      rememberMe: false,
    };

    beforeEach(() => {
      sinon.stub(request, 'post').named('request.post');

      (request.post as any).returns(Promise.resolve());
    });

    afterEach(() => {
      (request.post as any).restore();
    });

    it('should post to login api', () => {
      authentication.login(params);

      expect(request.post, 'to have a call satisfying', [
        '/api/authentication/login',
        params,
        {},
      ]);
    });

    it('should disable any token', () => {
      authentication.login(params);

      expect(request.post, 'to have a call satisfying', [
        '/api/authentication/login',
        params,
        { token: null },
      ]);
    });
  });

  describe('#validateToken()', () => {
    const validToken = 'foo';
    const validRefreshToken = 'bar';
    const user = { id: 1 };
    const validateTokenArgs: [number, string, string] = [
      user.id,
      validToken,
      validRefreshToken,
    ];

    beforeEach(() => {
      sinon.stub(accounts, 'getInfo');
      (accounts.getInfo as any).returns(Promise.resolve(user));
    });

    afterEach(() => {
      (accounts.getInfo as any).restore();
    });

    it('should request accounts.getInfo', () =>
      expect(
        authentication.validateToken(...validateTokenArgs),
        'to be fulfilled',
      ).then(() => {
        expect(accounts.getInfo, 'to have a call satisfying', [
          user.id,
          validToken,
        ]);
      }));

    it('should resolve with both tokens and user object', () =>
      expect(
        authentication.validateToken(...validateTokenArgs),
        'to be fulfilled with',
        {
          token: validToken,
          refreshToken: validRefreshToken,
          user,
        },
      ));

    it('rejects if token has a bad type', () =>
      expect(
        authentication.validateToken(user.id, {} as any),
        'to be rejected with',
        'token must be a string',
      ));

    it('should allow empty refreshToken', () =>
      expect(
        authentication.validateToken(user.id, 'foo', null),
        'to be fulfilled',
      ));

    it('rejects if accounts.getInfo request is unexpectedly failed', () => {
      const error = 'Something wrong';
      (accounts.getInfo as any).returns(Promise.reject(error));

      return expect(
        authentication.validateToken(...validateTokenArgs),
        'to be rejected with',
        error,
      );
    });

    describe('when token is expired', () => {
      const expiredResponse = {
        name: 'Unauthorized',
        message: 'Token expired',
        code: 0,
        status: 401,
        type: 'yii\\web\\UnauthorizedHttpException',
      };
      const newToken = 'baz';

      beforeEach(() => {
        sinon.stub(authentication, 'requestToken');

        (accounts.getInfo as any)
          .onCall(0)
          .returns(Promise.reject(expiredResponse));
        (authentication.requestToken as any).returns(Promise.resolve(newToken));
      });

      afterEach(() => {
        (authentication.requestToken as any).restore();
      });

      it('resolves with new token and user object', async () => {
        server.post('/api/authentication/refresh-token', {
          access_token: newToken,
          refresh_token: validRefreshToken,
          success: true,
          expires_in: 50000,
        });

        await expect(
          authentication.validateToken(...validateTokenArgs),
          'to be fulfilled with',
          { token: newToken, refreshToken: validRefreshToken, user },
        );

        expect(
          server.requests[0].requestBody,
          'to equal',
          `refresh_token=${validRefreshToken}`,
        );
      });

      it('rejects if token request failed', () => {
        const error = { error: 'Unexpected error example' };
        server.post('/api/authentication/refresh-token', error, 500);

        return expect(
          authentication.validateToken(...validateTokenArgs),
          'to be rejected with',
          error,
        );
      });
    });

    describe('when token is incorrect', () => {
      const expiredResponse = {
        name: 'Unauthorized',
        message: 'Incorrect token',
        code: 0,
        status: 401,
        type: 'yii\\web\\UnauthorizedHttpException',
      };
      const newToken = 'baz';

      beforeEach(() => {
        (accounts.getInfo as any)
          .onCall(0)
          .returns(Promise.reject(expiredResponse));
      });

      it('resolves with new token and user object', async () => {
        server.post('/api/authentication/refresh-token', {
          access_token: newToken,
          refresh_token: validRefreshToken,
          success: true,
          expires_in: 50000,
        });

        await expect(
          authentication.validateToken(...validateTokenArgs),
          'to be fulfilled with',
          { token: newToken, refreshToken: validRefreshToken, user },
        );

        expect(
          server.requests[0].requestBody,
          'to equal',
          `refresh_token=${validRefreshToken}`,
        );
      });

      it('rejects if token request failed', () => {
        const error = { error: 'Unexpected error example' };
        server.post('/api/authentication/refresh-token', error, 500);

        return expect(
          authentication.validateToken(...validateTokenArgs),
          'to be rejected with',
          error,
        );
      });
    });
  });

  describe('#logout', () => {
    beforeEach(() => {
      sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
      (request.post as any).restore();
    });

    it('should request logout api', () => {
      authentication.logout();

      expect(request.post, 'to have a call satisfying', [
        '/api/authentication/logout',
        {},
        {},
      ]);
    });

    it('returns a promise', () => {
      (request.post as any).returns(Promise.resolve());

      return expect(authentication.logout(), 'to be fulfilled');
    });

    it('overrides token if provided', () => {
      const token = 'foo';

      authentication.logout(token);

      expect(request.post, 'to have a call satisfying', [
        '/api/authentication/logout',
        {},
        { token },
      ]);
    });
  });

  describe('#requestToken', () => {
    const refreshToken = 'refresh-token';

    beforeEach(() => {
      sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
      (request.post as any).restore();
    });

    it('should request refresh-token api', () => {
      (request.post as any).returns(Promise.resolve({}));

      authentication.requestToken(refreshToken);

      expect(request.post, 'to have a call satisfying', [
        '/api/authentication/refresh-token',
        {
          refresh_token: refreshToken, // eslint-disable-line
        },
        {},
      ]);
    });

    it('should disable bearer auth for request', () => {
      (request.post as any).returns(Promise.resolve({}));

      authentication.requestToken(refreshToken);

      expect(request.post, 'to have a call satisfying', [
        '/api/authentication/refresh-token',
        {
          refresh_token: refreshToken, // eslint-disable-line
        },
        { token: null },
      ]);
    });

    it('should resolve with token', () => {
      const token = 'token';

      (request.post as any).returns(
        Promise.resolve({
          access_token: token, // eslint-disable-line
        }),
      );

      return expect(
        authentication.requestToken(refreshToken),
        'to be fulfilled with',
        token,
      );
    });
  });
});
