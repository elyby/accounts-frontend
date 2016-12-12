import expect from 'unexpected';
import sinon from 'sinon';

import request from 'services/request';
import authentication from 'services/api/authentication';
import accounts from 'services/api/accounts';

describe('authentication api', () => {
    describe('#validateToken()', () => {
        const validTokens = {token: 'foo', refreshToken: 'bar'};

        beforeEach(() => {
            sinon.stub(accounts, 'current');

            accounts.current.returns(Promise.resolve());
        });

        afterEach(() => {
            accounts.current.restore();
        });

        it('should request accounts.current', () =>
            expect(authentication.validateToken(validTokens), 'to be fulfilled')
                .then(() => {
                    expect(accounts.current, 'to have a call satisfying', [
                        {token: 'foo'}
                    ]);
                })
        );

        it('should resolve with both tokens', () =>
            expect(authentication.validateToken(validTokens), 'to be fulfilled with', validTokens)
        );

        it('rejects if token has a bad type', () =>
            expect(authentication.validateToken({token: {}}),
                'to be rejected with', 'token must be a string'
            )
        );

        it('should allow empty refreshToken', () =>
            expect(authentication.validateToken({token: 'foo', refreshToken: null}), 'to be fulfilled')
        );

        it('rejects if accounts.current request is unexpectedly failed', () => {
            const error = 'Something wrong';
            accounts.current.returns(Promise.reject(error));

            return expect(authentication.validateToken(validTokens),
                'to be rejected with', error
            );
        });

        describe('when token is expired', () => {
            const expiredResponse = {
                name: 'Unauthorized',
                message: 'Token expired',
                code: 0,
                status: 401,
                type: 'yii\\web\\UnauthorizedHttpException'
            };
            const newToken = 'baz';

            beforeEach(() => {
                sinon.stub(authentication, 'requestToken');

                accounts.current.returns(Promise.reject(expiredResponse));
                authentication.requestToken.returns(Promise.resolve({token: newToken}));
            });

            afterEach(() => {
                authentication.requestToken.restore();
            });

            it('resolves with new token', () =>
                expect(authentication.validateToken(validTokens),
                    'to be fulfilled with', {...validTokens, token: newToken}
                )
            );

            it('rejects if token request failed', () => {
                const error = 'Something wrong';
                authentication.requestToken.returns(Promise.reject(error));

                return expect(authentication.validateToken(validTokens),
                    'to be rejected with', error
                );
            });
        });
    });

    describe('#logout', () => {
        beforeEach(() => {
            sinon.stub(request, 'post').named('request.post');
        });

        afterEach(() => {
            request.post.restore();
        });

        it('should request logout api', () => {
            authentication.logout();

            expect(request.post, 'to have a call satisfying', [
                '/api/authentication/logout', {}, {}
            ]);
        });

        it('returns a promise', () => {
            request.post.returns(Promise.resolve());

            return expect(authentication.logout(), 'to be fulfilled');
        });

        it('overrides token if provided', () => {
            const token = 'foo';

            authentication.logout({token});

            expect(request.post, 'to have a call satisfying', [
                '/api/authentication/logout', {}, {token}
            ]);
        });
    });

    describe('#requestToken', () => {
        const refreshToken = 'refresh-token';

        beforeEach(() => {
            sinon.stub(request, 'post').named('request.post');
        });

        afterEach(() => {
            request.post.restore();
        });

        it('should request refresh-token api', () => {
            request.post.returns(Promise.resolve({}));

            authentication.requestToken(refreshToken);

            expect(request.post, 'to have a call satisfying', [
                '/api/authentication/refresh-token', {
                    refresh_token: refreshToken // eslint-disable-line
                }, {}
            ]);
        });

        it('should disable bearer auth for request', () => {
            request.post.returns(Promise.resolve({}));

            authentication.requestToken(refreshToken);

            expect(request.post, 'to have a call satisfying', [
                '/api/authentication/refresh-token', {
                    refresh_token: refreshToken // eslint-disable-line
                }, {token: null}
            ]);
        });

        it('should resolve with token', () => {
            const token = 'token';

            request.post.returns(Promise.resolve({
                access_token: token // eslint-disable-line
            }));

            return expect(authentication.requestToken(refreshToken),
                'to be fulfilled with', {token}
            );
        });
    });
});
