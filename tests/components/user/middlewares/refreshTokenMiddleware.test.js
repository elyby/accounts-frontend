import expect from 'unexpected';

import refreshTokenMiddleware from 'components/user/middlewares/refreshTokenMiddleware';

import authentication from 'services/api/authentication';

const refreshToken = 'foo';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0NzA3NjE0NDMsImV4cCI6MTQ3MDc2MTQ0MywiaWF0IjoxNDcwNzYxNDQzLCJqdGkiOiJpZDEyMzQ1NiJ9.gWdnzfQQvarGpkbldUvB8qdJZSVkvdNtCbhbbl2yJW8';
// valid till 2100 year
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0NzA3NjE5NzcsImV4cCI6NDEwMjQ0NDgwMCwiaWF0IjoxNDcwNzYxOTc3LCJqdGkiOiJpZDEyMzQ1NiJ9.M4KY4QgHOUzhpAZjWoHJbGsEJPR-RBsJ1c1BKyxvAoU';

describe('refreshTokenMiddleware', () => {
    let middleware;
    let getState;
    let dispatch;

    beforeEach(() => {
        sinon.stub(authentication, 'requestToken').named('authentication.requestToken');

        getState = sinon.stub().named('store.getState');
        dispatch = sinon.stub().named('store.dispatch');

        middleware = refreshTokenMiddleware({getState, dispatch});
    });

    afterEach(() => {
        authentication.requestToken.restore();
    });

    describe('#before', () => {
        describe('when token expired', () => {
            beforeEach(() => {
                getState.returns({
                    user: {
                        token: expiredToken,
                        refreshToken
                    }
                });
            });

            it('should request new token', () => {
                const data = {
                    url: 'foo',
                    options: {
                        headers: {}
                    }
                };

                authentication.requestToken.returns(Promise.resolve({token: validToken}));

                return middleware.before(data).then((resp) => {
                    expect(resp, 'to satisfy', data);

                    expect(authentication.requestToken, 'to have a call satisfying', [
                        refreshToken
                    ]);
                });
            });

            it('should not apply to refresh-token request', () => {
                const data = {url: '/refresh-token'};
                const resp = middleware.before(data);

                expect(resp, 'to satisfy', data);

                expect(authentication.requestToken, 'was not called');
            });

            it('should not apply if options.autoRefreshToken === false', () => {
                const data = {
                    url: 'foo',
                    options: {autoRefreshToken: false}
                };
                middleware.before(data);

                expect(authentication.requestToken, 'was not called');
            });

            xit('should update user with new token'); // TODO: need a way to test, that action was called
            xit('should logout if invalid token'); // TODO: need a way to test, that action was called

            xit('should logout if token request failed', () => {
                authentication.requestToken.returns(Promise.reject());

                return middleware.before({url: 'foo'}).then((resp) => {
                    // TODO: need a way to test, that action was called
                    expect(dispatch, 'to have a call satisfying', logout);
                });
            });
        });

        it('should not be applied if no token', () => {
            getState.returns({
                user: {}
            });

            const data = {url: 'foo'};
            const resp = middleware.before(data);

            expect(resp, 'to satisfy', data);

            expect(authentication.requestToken, 'was not called');
        });
    });

    describe('#catch', () => {
        const expiredResponse = {
            name: 'Unauthorized',
            message: 'Token expired',
            code: 0,
            status: 401,
            type: 'yii\\web\\UnauthorizedHttpException'
        };

        const badTokenReponse = {
            name: 'Unauthorized',
            message: 'Token expired',
            code: 0,
            status: 401,
            type: 'yii\\web\\UnauthorizedHttpException'
        };

        let restart;

        beforeEach(() => {
            getState.returns({
                user: {
                    refreshToken
                }
            });

            restart = sinon.stub().named('restart');

            authentication.requestToken.returns(Promise.resolve({token: validToken}));
        });

        it('should request new token if expired', () =>
            middleware.catch(expiredResponse, {options: {}}, restart).then(() => {
                expect(authentication.requestToken, 'to have a call satisfying', [
                    refreshToken
                ]);
                expect(restart, 'was called');
            })
        );

        xit('should logout user if token cannot be refreshed', () => {
            // TODO: need a way to test, that action was called
            return middleware.catch(badTokenReponse, {options: {}}, restart).then(() => {
                // TODO
            });
        });

        it('should pass the request through if options.autoRefreshToken === false', () => {
            const promise = middleware.catch(expiredResponse, {
                options: {
                    autoRefreshToken: false
                }
            }, restart);

            return expect(promise, 'to be rejected with', expiredResponse).then(() => {
                expect(restart, 'was not called');
                expect(authentication.requestToken, 'was not called');
            });
        });

        it('should pass the rest of failed requests through', () => {
            const resp = {};

            const promise = middleware.catch(resp, {
                options: {}
            }, restart);

            return expect(promise, 'to be rejected with', resp).then(() => {
                expect(restart, 'was not called');
                expect(authentication.requestToken, 'was not called');
            });
        });
    });
});
