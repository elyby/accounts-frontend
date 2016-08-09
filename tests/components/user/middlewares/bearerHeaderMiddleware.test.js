import expect from 'unexpected';

import bearerHeaderMiddleware from 'components/user/middlewares/bearerHeaderMiddleware';

describe('bearerHeaderMiddleware', () => {
    it('should set Authorization header', () => {
        const token = 'foo';
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
                user: {token}
            })
        });

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
