import expect from 'app/test/unexpected';
import sinon from 'sinon';

// Stub the functions in the module itself: the index re-exports them as getters, which sinon can't replace
import * as request from 'app/services/request/request';
import { InternalServerError, RequestAbortedError, UnauthorizedError } from 'app/services/request';
import logger from 'app/services/logger';
import * as authentication from 'app/services/api/authentication';
import * as accounts from 'app/services/api/accounts';

describe('authentication api', () => {
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

            expect(request.post, 'to have a call satisfying', ['/api/authentication/login', params, {}]);
        });

        it('should disable any token', () => {
            authentication.login(params);

            expect(request.post, 'to have a call satisfying', ['/api/authentication/login', params, { token: null }]);
        });
    });

    describe('#validateToken()', () => {
        const validToken = 'foo';
        const validRefreshToken = 'bar';
        const user = { id: 1 };
        const validateTokenArgs: [number, string, string] = [user.id, validToken, validRefreshToken];

        beforeEach(() => {
            sinon.stub(accounts, 'getInfo');
            (accounts.getInfo as any).returns(Promise.resolve(user));
        });

        afterEach(() => {
            (accounts.getInfo as any).restore();
        });

        it('should request accounts.getInfo', () =>
            expect(authentication.validateToken(...validateTokenArgs), 'to be fulfilled').then(() => {
                expect(accounts.getInfo, 'to have a call satisfying', [user.id, validToken]);
            }));

        it('should resolve with both tokens and user object', () =>
            expect(authentication.validateToken(...validateTokenArgs), 'to be fulfilled with', {
                token: validToken,
                refreshToken: validRefreshToken,
                user,
            }));

        it('rejects if token has a bad type', () =>
            expect(authentication.validateToken(user.id, {} as any), 'to be rejected with', 'token must be a string'));

        it('should allow empty refreshToken', () =>
            expect(authentication.validateToken(user.id, 'foo', null), 'to be fulfilled'));

        it('rejects if accounts.getInfo request is unexpectedly failed', () => {
            const error = 'Something wrong';
            (accounts.getInfo as any).returns(Promise.reject(error));

            return expect(authentication.validateToken(...validateTokenArgs), 'to be rejected with', error);
        });

        it('rejects without logging on network error', async () => {
            const error = new RequestAbortedError(new TypeError('Failed to fetch'));
            (accounts.getInfo as any).returns(Promise.reject(error));
            sinon.stub(logger, 'error');

            try {
                await expect(authentication.validateToken(...validateTokenArgs), 'to be rejected with', error);

                expect(logger.error, 'was not called');
            } finally {
                (logger.error as any).restore();
            }
        });

        describe('when token is expired', () => {
            const expiredResponse = new UnauthorizedError(new Response('{}', { status: 401 }), {
                name: 'Unauthorized',
                message: 'Token expired',
                code: 0,
                status: 401,
                type: 'yii\\web\\UnauthorizedHttpException',
            });
            const newToken = 'baz';

            beforeEach(() => {
                sinon.stub(window, 'fetch').named('fetch');
                sinon.stub(authentication, 'requestToken');

                (accounts.getInfo as any).onCall(0).returns(Promise.reject(expiredResponse));
                (authentication.requestToken as any).returns(Promise.resolve(newToken));
            });

            afterEach(() => {
                (window.fetch as any).restore();
                (authentication.requestToken as any).restore();
            });

            it('resolves with new token and user object', async () => {
                const sentRequests: Array<{ url: string; body: string }> = [];
                (fetch as any).callsFake(async (req: Request) => {
                    sentRequests.push({ url: new URL(req.url).pathname, body: await req.text() });

                    return new Response(
                        JSON.stringify({
                            access_token: newToken,
                            refresh_token: validRefreshToken,
                            success: true,
                            expires_in: 50000,
                        }),
                        { status: 200 },
                    );
                });

                await expect(authentication.validateToken(...validateTokenArgs), 'to be fulfilled with', {
                    token: newToken,
                    refreshToken: validRefreshToken,
                    user,
                });

                expect(sentRequests, 'to equal', [
                    { url: '/api/authentication/refresh-token', body: `refresh_token=${validRefreshToken}` },
                ]);
            });

            it('rejects if token request failed', () => {
                const error = { error: 'Unexpected error example' };

                (fetch as any).returns(Promise.resolve(new Response(JSON.stringify(error), { status: 500 })));

                return expect(
                    authentication.validateToken(...validateTokenArgs),
                    'to be rejected with',
                    expect.it('to be an', InternalServerError),
                );
            });
        });

        describe('when token is incorrect', () => {
            const expiredResponse = new UnauthorizedError(new Response('{}', { status: 401 }), {
                name: 'Unauthorized',
                message: 'Incorrect token',
                code: 0,
                status: 401,
                type: 'yii\\web\\UnauthorizedHttpException',
            });
            const newToken = 'baz';

            beforeEach(() => {
                sinon.stub(window, 'fetch').named('fetch');

                (accounts.getInfo as any).onCall(0).returns(Promise.reject(expiredResponse));
            });

            afterEach(() => {
                (window.fetch as any).restore();
            });

            it('resolves with new token and user object', async () => {
                const sentRequests: Array<{ url: string; body: string }> = [];
                (fetch as any).callsFake(async (req: Request) => {
                    sentRequests.push({ url: new URL(req.url).pathname, body: await req.text() });

                    return new Response(
                        JSON.stringify({
                            access_token: newToken,
                            refresh_token: validRefreshToken,
                            success: true,
                            expires_in: 50000,
                        }),
                        { status: 200 },
                    );
                });

                await expect(authentication.validateToken(...validateTokenArgs), 'to be fulfilled with', {
                    token: newToken,
                    refreshToken: validRefreshToken,
                    user,
                });

                expect(sentRequests, 'to equal', [
                    { url: '/api/authentication/refresh-token', body: `refresh_token=${validRefreshToken}` },
                ]);
            });

            it('rejects if token request failed', () => {
                const error = { error: 'Unexpected error example' };

                (fetch as any).returns(Promise.resolve(new Response(JSON.stringify(error), { status: 500 })));

                return expect(
                    authentication.validateToken(...validateTokenArgs),
                    'to be rejected with',
                    expect.it('to be an', InternalServerError),
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

            expect(request.post, 'to have a call satisfying', ['/api/authentication/logout', {}, {}]);
        });

        it('returns a promise', () => {
            (request.post as any).returns(Promise.resolve());

            return expect(authentication.logout(), 'to be fulfilled');
        });

        it('overrides token if provided', () => {
            const token = 'foo';

            authentication.logout(token);

            expect(request.post, 'to have a call satisfying', ['/api/authentication/logout', {}, { token }]);
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

            return expect(authentication.requestToken(refreshToken), 'to be fulfilled with', token);
        });
    });
});
