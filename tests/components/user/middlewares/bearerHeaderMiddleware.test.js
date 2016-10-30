import expect from 'unexpected';

import bearerHeaderMiddleware from 'components/user/middlewares/bearerHeaderMiddleware';

describe('bearerHeaderMiddleware', () => {
    describe('when token available', () => {
        const token = 'foo';
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
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

            expect(data.options.headers, 'to satisfy', {
                Authorization: `Bearer ${token}`
            });
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

            expect(data.options.headers, 'to satisfy', {
                Authorization: `Bearer ${tokenOverride}`
            });
        });
    });

    it('should not set Authorization header if no token', () => {
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
                user: {}
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
});
