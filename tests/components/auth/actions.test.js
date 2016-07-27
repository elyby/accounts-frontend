import request from 'services/request';

import {
    oAuthValidate,
    oAuthComplete,
    setClient,
    setOAuthRequest,
    setScopes,
    setOAuthCode,
    requirePermissionsAccept
} from 'components/auth/actions';

const oauthData = {
    clientId: '',
    redirectUrl: '',
    responseType: '',
    scope: '',
    state: ''
};

describe('components/auth/actions', () => {
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

    describe('#oAuthValidate()', () => {
        it('should dispatch setClient, setOAuthRequest and setScopes', () => {
            // TODO: the assertions may be splitted up to one per test

            const resp = {
                client: {id: 123},
                oAuth: {state: 123},
                session: {
                    scopes: ['scopes']
                }
            };

            request.get.returns(Promise.resolve(resp));

            return callThunk(oAuthValidate, oauthData).then(() => {
                sinon.assert.calledWith(request.get, '/api/oauth/validate');
                sinon.assert.calledWith(dispatch, setClient(resp.client));
                sinon.assert.calledWith(dispatch, setOAuthRequest(resp.oAuth));
                sinon.assert.calledWith(dispatch, setScopes(resp.session.scopes));
            });
        });
    });

    describe('#oAuthComplete()', () => {
        beforeEach(() => {
            getState.returns({
                auth: {
                    oauth: oauthData
                }
            });
        });

        it('should dispatch setOAuthCode for static_page redirect', () => {
            // TODO: it may be split on separate url and dispatch tests
            const resp = {
                success: true,
                redirectUri: 'static_page?code=123&state='
            };

            request.post.returns(Promise.resolve(resp));

            return callThunk(oAuthComplete).then(() => {
                sinon.assert.calledWithMatch(request.post, /\/api\/oauth\/complete/);
                sinon.assert.calledWith(dispatch, setOAuthCode({
                    success: true,
                    code: '123',
                    displayCode: false
                }));
            });
        });

        it('should resolve to with success false and redirectUri for access_denied', () => {
            const resp = {
                statusCode: 401,
                error: 'access_denied',
                redirectUri: 'redirectUri'
            };

            request.post.returns(Promise.reject(resp));

            return callThunk(oAuthComplete).then((resp) => {
                expect(resp).to.be.deep.equal({
                    success: false,
                    redirectUri: 'redirectUri'
                });
            });
        });

        it('should dispatch requirePermissionsAccept if accept_required', () => {
            const resp = {
                statusCode: 401,
                error: 'accept_required'
            };

            request.post.returns(Promise.reject(resp));

            return callThunk(oAuthComplete).catch((resp) => {
                expect(resp.acceptRequired).to.be.true;
                sinon.assert.calledWith(dispatch, requirePermissionsAccept());
            });
        });
    });
});
