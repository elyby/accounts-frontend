import expect from 'test/unexpected';
import sinon from 'sinon';

import refreshTokenMiddleware from 'components/user/middlewares/refreshTokenMiddleware';
import { browserHistory } from 'services/history';
import * as authentication from 'services/api/authentication';
import { InternalServerError } from 'services/request';
import { updateToken } from 'components/accounts/actions';

const refreshToken = 'foo';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0NzA3NjE0NDMsImV4cCI6MTQ3MDc2MTQ0MywiaWF0IjoxNDcwNzYxNDQzLCJqdGkiOiJpZDEyMzQ1NiJ9.gWdnzfQQvarGpkbldUvB8qdJZSVkvdNtCbhbbl2yJW8';
// valid till 2100 year
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0NzA3NjE5NzcsImV4cCI6NDEwMjQ0NDgwMCwiaWF0IjoxNDcwNzYxOTc3LCJqdGkiOiJpZDEyMzQ1NiJ9.M4KY4QgHOUzhpAZjWoHJbGsEJPR-RBsJ1c1BKyxvAoU';

describe('refreshTokenMiddleware', () => {
    let middleware;
    let getState;
    let dispatch;

    const email = 'test@email.com';

    beforeEach(() => {
        sinon.stub(authentication, 'requestToken').named('authentication.requestToken');
        sinon.stub(authentication, 'logout').named('authentication.logout');
        sinon.stub(browserHistory, 'push');

        getState = sinon.stub().named('store.getState');
        dispatch = sinon.spy((arg) =>
            typeof arg === 'function' ? arg(dispatch, getState) : arg
        ).named('store.dispatch');

        middleware = refreshTokenMiddleware({getState, dispatch});
    });

    afterEach(() => {
        authentication.requestToken.restore();
        authentication.logout.restore();
        browserHistory.push.restore();
    });

    function assertRelogin() {
        expect(dispatch, 'to have a call satisfying', [
            {
                type: 'auth:setCredentials',
                payload: {
                    login: email,
                    returnUrl: expect.it('to be a string'),
                },
            }
        ]);

        expect(browserHistory.push, 'to have a call satisfying', [
            '/login'
        ]);
    }

    it('must be till 2100 to test with validToken', () =>
        expect(new Date().getFullYear(), 'to be less than', 2100)
    );

    describe('#before', () => {
        describe('when token expired', () => {
            beforeEach(() => {
                const account = {
                    email,
                    token: expiredToken,
                    refreshToken
                };
                getState.returns({
                    accounts: {
                        active: account.id,
                        available: [account]
                    },
                    auth: {
                        credentials: {},
                    },
                    user: {},
                });
            });

            it('should request new token', () => {
                const data = {
                    url: 'foo',
                    options: {
                        headers: {}
                    }
                };

                authentication.requestToken.returns(Promise.resolve(validToken));

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

                authentication.requestToken.returns(Promise.resolve(validToken));

                return middleware.before(data).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        updateToken(validToken)
                    ])
                );
            });

            it('should relogin if token can not be parsed', () => {
                const account = {
                    email,
                    token: 'realy bad token',
                    refreshToken
                };
                getState.returns({
                    accounts: {
                        active: account.id,
                        available: [account]
                    },
                    auth: {
                        credentials: {},
                    },
                    user: {},
                });

                const req = {url: 'foo', options: {}};

                return expect(middleware.before(req), 'to be rejected with', {
                    message: 'Invalid token'
                })
                    .then(() => {
                        expect(authentication.requestToken, 'was not called');

                        assertRelogin();
                    });
            });

            it('should relogin if token request failed', () => {
                authentication.requestToken.returns(Promise.reject());

                return expect(middleware.before({url: 'foo', options: {}}), 'to be rejected')
                    .then(() =>
                        assertRelogin()
                    );
            });

            it('should not logout if request failed with 5xx', () => {
                const resp = new InternalServerError(null, {status: 500});

                authentication.requestToken.returns(Promise.reject(resp));

                return expect(middleware.before({url: 'foo', options: {}}), 'to be rejected with', resp).then(() =>
                    expect(dispatch, 'to have no calls satisfying', [
                        {payload: {isGuest: true}}
                    ])
                );
            });
        });

        it('should not be applied if no token', () => {
            getState.returns({
                accounts: {
                    active: null,
                    available: [],
                },
                user: {}
            });

            const data = {
                url: 'foo',
                options: {},
            };
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
                    active: 1,
                    available: [{
                        id: 1,
                        email,
                        token: 'old token',
                        refreshToken,
                    }]
                },
                user: {}
            });

            restart = sinon.stub().named('restart');

            authentication.requestToken.returns(Promise.resolve(validToken));
        });

        function assertNewTokenRequest() {
            expect(authentication.requestToken, 'to have a call satisfying', [
                refreshToken
            ]);
            expect(restart, 'was called');
            expect(dispatch, 'was called');
        }

        it('should request new token if expired', () =>
            expect(
                middleware.catch(expiredResponse, {options: {}}, restart),
                'to be fulfilled'
            ).then(assertNewTokenRequest)
        );

        it('should request new token if invalid credential', () =>
            expect(
                middleware.catch(badTokenReponse, {options: {}}, restart),
                'to be fulfilled'
            ).then(assertNewTokenRequest)
        );

        it('should request new token if token is incorrect', () =>
            expect(
                middleware.catch(incorrectTokenReponse, {options: {}}, restart),
                'to be fulfilled'
            ).then(assertNewTokenRequest)
        );

        it('should relogin if no refreshToken', () => {
            getState.returns({
                accounts: {
                    active: 1,
                    available: [{
                        id: 1,
                        email,
                        refreshToken: null,
                    }]
                },
                auth: {
                    credentials: {},
                },
                user: {},
            });

            return expect(
                middleware.catch(incorrectTokenReponse, {options: {}}, restart),
                'to be rejected'
            ).then(() => {
                assertRelogin();
            });
        });

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
