/* eslint-disable @typescript-eslint/no-non-null-assertion */
import expect from 'app/test/unexpected';
import { State as RootState } from 'app/types';

import bearerHeaderMiddleware from 'app/components/user/middlewares/bearerHeaderMiddleware';
import { MiddlewareRequestOptions } from '../../../services/request/PromiseMiddlewareLayer';

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
            let data: MiddlewareRequestOptions = {
                url: '',
                options: {
                    headers: {},
                },
            };

            data = await middleware.before!(data);

            expectBearerHeader(data, token);
        });

        it('overrides user.token with options.token if available', async () => {
            const tokenOverride = 'tokenOverride';
            let data: MiddlewareRequestOptions = {
                url: '',
                options: {
                    headers: {},
                    token: tokenOverride,
                },
            };

            data = await middleware.before!(data);

            expectBearerHeader(data, tokenOverride);
        });

        it('disables token if options.token is null', async () => {
            const tokenOverride = null;
            const data: any = {
                options: {
                    headers: {},
                    token: tokenOverride,
                },
            };

            const resp = await middleware.before!(data);

            expect(resp.options.headers.Authorization, 'to be undefined');
        });
    });

    it('should not set Authorization header if no token', async () => {
        const middleware = bearerHeaderMiddleware({
            getState: () => ({
                ...emptyState,
            }),
        } as any);

        const data: MiddlewareRequestOptions = {
            url: '',
            options: {
                headers: {},
            },
        };

        const resp = await middleware.before!(data);

        expect(resp.options.headers.Authorization, 'to be undefined');
    });

    function expectBearerHeader(data: MiddlewareRequestOptions, token: string) {
        expect(data.options.headers, 'to satisfy', {
            Authorization: `Bearer ${token}`,
        });
    }
});
