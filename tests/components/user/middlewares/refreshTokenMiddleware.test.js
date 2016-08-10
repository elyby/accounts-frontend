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
        it('should request new token', () => {
            getState.returns({
                user: {
                    token: expiredToken,
                    refreshToken
                }
            });

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

        it('should not be applied if no token', () => {
            getState.returns({
                user: {}
            });

            const data = {url: 'foo'};
            const resp = middleware.before(data);

            expect(resp, 'to satisfy', data);

            expect(authentication.requestToken, 'was not called');
        });

        it('should not apply to refresh-token request', () => {
            getState.returns({
                user: {}
            });

            const data = {url: '/refresh-token'};
            const resp = middleware.before(data);

            expect(resp, 'to satisfy', data);

            expect(authentication.requestToken, 'was not called');
        });

        xit('should update user with new token'); // TODO: need a way to test, that action was called
        xit('should logout if invalid token'); // TODO: need a way to test, that action was called

        xit('should logout if token request failed', () => {
            getState.returns({
                user: {
                    token: expiredToken,
                    refreshToken
                }
            });

            authentication.requestToken.returns(Promise.reject());

            return middleware.before({url: 'foo'}).then((resp) => {
                // TODO: need a way to test, that action was called
                expect(dispatch, 'to have a call satisfying', logout);
            });
        });
    });

    describe('#catch', () => {
        it('should request new token', () => {
            getState.returns({
                user: {
                    refreshToken
                }
            });

            const restart = sinon.stub().named('restart');

            authentication.requestToken.returns(Promise.resolve({token: validToken}));

            return middleware.catch({
                status: 401,
                message: 'Token expired'
            }, restart).then(() => {
                expect(authentication.requestToken, 'to have a call satisfying', [
                    refreshToken
                ]);
                expect(restart, 'was called');
            });
        });

        xit('should logout user if token cannot be refreshed'); // TODO: need a way to test, that action was called

        it('should pass the rest of failed requests through', () => {
            const resp = {};

            const promise = middleware.catch(resp);

            expect(promise, 'to be rejected');

            return promise.catch((actual) => {
                expect(actual, 'to be', resp);
            });
        });
    });
});
