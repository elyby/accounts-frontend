import expect from 'unexpected';

import { routeActions } from 'react-router-redux';

import request from 'services/request';

import {
    logout,
    setUser
} from 'components/user/actions';


describe('components/user/actions', () => {
    const getState = sinon.stub().named('store.getState');
    const dispatch = sinon.spy((arg) =>
        typeof arg === 'function' ? arg(dispatch, getState) : arg
    ).named('store.dispatch');

    const callThunk = function(fn, ...args) {
        const thunk = fn(...args);

        return thunk(dispatch, getState);
    };

    beforeEach(() => {
        dispatch.reset();
        getState.reset();
        getState.returns({});
        sinon.stub(request, 'get').named('request.get');
        sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
        request.get.restore();
        request.post.restore();
    });

    describe('#logout()', () => {
        beforeEach(() => {
            request.post.returns(Promise.resolve());
        });

        describe('user with jwt', () => {
            beforeEach(() => {
                getState.returns({
                    user: {
                        token: 'iLoveRockNRoll',
                        lang: 'foo'
                    }
                });
            });

            it('should post to /api/authentication/logout with user jwt', () => {
                // TODO: need an integration test with a middleware, because this
                // test is not reliable to check, whether logout request will have token inside
                request.post.returns(new Promise((resolve) => {
                    setTimeout(() => {
                        // we must not overwrite user's token till request starts
                        expect(dispatch, 'was not called');

                        resolve();
                    }, 0);
                }));

                return callThunk(logout).then(() => {
                    expect(request.post, 'to have a call satisfying', [
                        '/api/authentication/logout'
                    ]);
                });
            });

            testChangedToGuest();
            testRedirectedToLogin();
        });

        describe('user without jwt', () => { // (a guest with partially filled user's state)
            beforeEach(() => {
                getState.returns({
                    user: {
                        lang: 'foo'
                    }
                });
            });

            it('should not post to /api/authentication/logout', () =>
                callThunk(logout).then(() => {
                    expect(request.post, 'was not called');
                })
            );

            testChangedToGuest();
            testRedirectedToLogin();
        });

        function testChangedToGuest() {
            it('should change user to guest', () =>
                callThunk(logout).then(() => {
                    expect(dispatch, 'to have a call satisfying', [
                        setUser({
                            lang: 'foo',
                            isGuest: true
                        })
                    ]);
                })
            );
        }

        function testRedirectedToLogin() {
            it('should redirect to /login', () =>
                callThunk(logout).then(() => {
                    expect(dispatch, 'to have a call satisfying', [
                        routeActions.push('/login')
                    ]);
                })
            );
        }
    });
});
