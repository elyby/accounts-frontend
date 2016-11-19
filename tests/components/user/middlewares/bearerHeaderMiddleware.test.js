import expect from 'unexpected';

import bearerHeaderMiddleware from 'components/user/middlewares/bearerHeaderMiddleware';

describe('bearerHeaderMiddleware', () => {
    const emptyState = {
        user: {},
        accounts: {
            active: null
        }
    };

    describe('when token available', () => {
        const token = 'foo';
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
                ...emptyState,
                accounts: {
                    active: {token}
                }
            })
        });

        it('should set Authorization header', () => {
            const data = {
                options: {
                    headers: {}
                }
            };

            middleware.before(data);

            expectBearerHeader(data, token);
        });

        it('overrides user.token with options.token if available', () => {
            const tokenOverride = 'tokenOverride';
            const data = {
                options: {
                    headers: {},
                    token: tokenOverride
                }
            };

            middleware.before(data);

            expectBearerHeader(data, tokenOverride);
        });
    });

    describe('when legacy token available', () => {
        const token = 'foo';
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
                ...emptyState,
                user: {token}
            })
        });

        it('should set Authorization header', () => {
            const data = {
                options: {
                    headers: {}
                }
            };

            middleware.before(data);

            expectBearerHeader(data, token);
        });
    });

    it('should not set Authorization header if no token', () => {
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
                ...emptyState
            })
        });

        const data = {
            options: {
                headers: {}
            }
        };

        middleware.before(data);

        expect(data.options.headers.Authorization, 'to be undefined');
    });

    function expectBearerHeader(data, token) {
        expect(data.options.headers, 'to satisfy', {
            Authorization: `Bearer ${token}`
        });
    }
});
