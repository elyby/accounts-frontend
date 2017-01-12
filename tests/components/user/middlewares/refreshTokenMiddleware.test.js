import expect from 'unexpected';
import sinon from 'sinon';

import refreshTokenMiddleware from 'components/user/middlewares/refreshTokenMiddleware';

import authentication from 'services/api/authentication';
import { updateToken } from 'components/accounts/actions';

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
        sinon.stub(authentication, 'logout').named('authentication.logout');

        getState = sinon.stub().named('store.getState');
        dispatch = sinon.spy((arg) =>
            typeof arg === 'function' ? arg(dispatch, getState) : arg
        ).named('store.dispatch');

        middleware = refreshTokenMiddleware({getState, dispatch});
    });

    afterEach(() => {
        authentication.requestToken.restore();
        authentication.logout.restore();
    });

    it('must be till 2100 to test with validToken', () =>
        expect(new Date().getFullYear(), 'to be less than', 2100)
    );

    describe('#before', () => {
        describe('when token expired', () => {
            beforeEach(() => {
                const account = {
                    token: expiredToken,
                    refreshToken
                };
                getState.returns({
                    accounts: {
                        active: account,
                        available: [account]
                    },
                    user: {}
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
                const data = {url: '/refresh-token', options: {}};
                const resp = middleware.before(data);


                return expect(resp, 'to be fulfilled with', data)
                    .then(() =>
                        expect(authentication.requestToken, 'was not called')
                    );
            });

            it('should not auto refresh token if options.token specified', () => {
                const data = {
                    url: 'foo',
                    options: {token: 'foo'}
                };
                middleware.before(data);

                expect(authentication.requestToken, 'was not called');
            });

            it('should update user with new token', () => {
                const data = {
                    url: 'foo',
                    options: {
                        headers: {}
                    }
                };

                authentication.requestToken.returns(Promise.resolve({token: validToken}));

                return middleware.before(data).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        updateToken(validToken)
                    ])
                );
            });

            it('should if token can not be parsed', () => {
                const account = {
                    token: 'realy bad token',
                    refreshToken
                };
                getState.returns({
                    accounts: {
                        active: account,
                        available: [account]
                    },
                    user: {}
                });

                const req = {url: 'foo', options: {}};

                return expect(middleware.before(req), 'to be fulfilled with', req).then(() => {
                    expect(authentication.requestToken, 'was not called');

                    expect(dispatch, 'to have a call satisfying', [
                        {payload: {isGuest: true}}
                    ]);
                });
            });

            it('should logout if token request failed', () => {
                authentication.requestToken.returns(Promise.reject());

                return expect(middleware.before({url: 'foo', options: {}}), 'to be fulfilled').then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        {payload: {isGuest: true}}
                    ])
                );
            });
        });

        it('should not be applied if no token', () => {
            getState.returns({
                accounts: {
                    active: null
                },
                user: {}
            });

            const data = {url: 'foo'};
            const resp = middleware.before(data);

            return expect(resp, 'to be fulfilled with', data)
                .then(() =>
                    expect(authentication.requestToken, 'was not called')
                );
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
            message: 'You are requesting with an invalid credential.',
            code: 0,
            status: 401,
            type: 'yii\\web\\UnauthorizedHttpException'
        };

        const incorrectTokenReponse = {
            name: 'Unauthorized',
            message: 'Incorrect token',
            code: 0,
            status: 401,
            type: 'yii\\web\\UnauthorizedHttpException'
        };

        let restart;

        beforeEach(() => {
            getState.returns({
                accounts: {
                    active: {refreshToken},
                    available: [{refreshToken}]
                },
                user: {}
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

        it('should logout user if invalid credential', () =>
            expect(
                middleware.catch(badTokenReponse, {options: {}}, restart),
                'to be rejected'
            ).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    {payload: {isGuest: true}}
                ])
            )
        );

        it('should logout user if token is incorrect', () =>
            expect(
                middleware.catch(incorrectTokenReponse, {options: {}}, restart),
                'to be rejected'
            ).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    {payload: {isGuest: true}}
                ])
            )
        );

        it('should pass the request through if options.token specified', () => {
            const promise = middleware.catch(expiredResponse, {
                options: {
                    token: 'foo'
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
