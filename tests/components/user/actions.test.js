import { routeActions } from 'react-router-redux';

import request from 'services/request';

import {
    logout,
    setUser
} from 'components/user/actions';


describe('components/user/actions', () => {
    const dispatch = sinon.stub();
    const getState = sinon.stub();

    const callThunk = function(fn, ...args) {
        const thunk = fn(...args);

        return thunk(dispatch, getState);
    };

    beforeEach(() => {
        dispatch.reset();
        getState.reset();
        getState.returns({});
        sinon.stub(request, 'get');
        sinon.stub(request, 'post');
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
                    sinon.assert.notCalled(dispatch);

                    resolve();
                }, 0);
            }));

            return callThunk(logout).then(() => {
                sinon.assert.calledWith(request.post, '/api/authentication/logout');
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
                sinon.assert.calledWith(dispatch, setUser({
                    lang: 'foo',
                    isGuest: true
                }));
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
                sinon.assert.calledWith(dispatch, routeActions.push('/login'));
            });
        });
    });
});
