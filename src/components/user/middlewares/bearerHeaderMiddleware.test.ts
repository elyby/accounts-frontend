import expect from 'test/unexpected';
import { RootState } from 'reducers';

import bearerHeaderMiddleware from 'components/user/middlewares/bearerHeaderMiddleware';

describe('bearerHeaderMiddleware', () => {
  const emptyState: RootState = {
    user: {},
    accounts: {
      active: null,
      available: [],
    },
  } as any;

  describe('when token available', () => {
    const token = 'foo';
    const middleware = bearerHeaderMiddleware({
      getState: () => ({
        ...emptyState,
        accounts: {
          active: 1,
          available: [
            {
              id: 1,
              token,
              username: 'username',
              email: 'email',
              refreshToken: null,
            },
          ],
        },
      }),
    } as any);

    it('should set Authorization header', async () => {
      let data: any = {
        options: {
          headers: {},
        },
      };

      data = middleware.before && (await middleware.before(data));

      expectBearerHeader(data, token);
    });

    it('overrides user.token with options.token if available', async () => {
      const tokenOverride = 'tokenOverride';
      let data: any = {
        options: {
          headers: {},
          token: tokenOverride,
        },
      };

      data = middleware.before && (await middleware.before(data));

      expectBearerHeader(data, tokenOverride);
    });

    it('disables token if options.token is null', async () => {
      const tokenOverride = null;
      const data: any = {
        options: {
          headers: {} as { [key: string]: any },
          token: tokenOverride,
        },
      };

      if (!middleware.before) {
        throw new Error('No middleware.before');
      }

      const resp = await middleware.before(data);

      expect(resp.options.headers.Authorization, 'to be undefined');
    });
  });

  it('should not set Authorization header if no token', async () => {
    const middleware = bearerHeaderMiddleware({
      getState: () => ({
        ...emptyState,
      }),
    } as any);

    const data: any = {
      options: {
        headers: {} as { [key: string]: any },
      },
    };

    if (!middleware.before) {
      throw new Error('No middleware.before');
    }

    const resp = await middleware.before(data);

    expect(resp.options.headers.Authorization, 'to be undefined');
  });

  function expectBearerHeader(data, token) {
    expect(data.options.headers, 'to satisfy', {
      Authorization: `Bearer ${token}`,
    });
  }
});
