import expect from 'unexpected';

import { routeActions } from 'react-router-redux';

import request from 'services/request';

import {
    logout,
    setUser
} from 'components/user/actions';


describe('components/user/actions', () => {
    const dispatch = sinon.stub().named('dispatch');
    const getState = sinon.stub().named('getState');

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
        it('should post to /api/authentication/logout with user jwt', () => {
            getState.returns({
                user: {
                    lang: 'foo'
                }
            });

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

        it('should change user to guest', () => {
            getState.returns({
                user: {
                    lang: 'foo'
                }
            });

            request.post.returns(Promise.resolve());

            return callThunk(logout).then(() => {
                expect(dispatch, 'to have a call satisfying', [
                    setUser({
                        lang: 'foo',
                        isGuest: true
                    })
                ]);
            });
        });

        it('should redirect to /login', () => {
            getState.returns({
                user: {
                    lang: 'foo'
                }
            });

            request.post.returns(Promise.resolve());

            return callThunk(logout).then(() => {
                expect(dispatch, 'to have a call satisfying', [
                    routeActions.push('/login')
                ]);
            });
        });
    });
});
