import expect from 'unexpected';

import request from 'services/request';

import {
    setLoadingState,
    oAuthValidate,
    oAuthComplete,
    setClient,
    setOAuthRequest,
    setScopes,
    setOAuthCode,
    requirePermissionsAccept,
    login,
    setLogin
} from 'components/auth/actions';

const oauthData = {
    clientId: '',
    redirectUrl: '',
    responseType: '',
    scope: '',
    state: ''
};

describe('components/auth/actions', () => {
    const dispatch = sinon.stub().named('store.dispatch');
    const getState = sinon.stub().named('store.getState');

    function callThunk(fn, ...args) {
        const thunk = fn(...args);

        return thunk(dispatch, getState);
    }

    function expectDispatchCalls(calls) {
        expect(dispatch, 'to have calls satisfying', [
            [setLoadingState(true)]
        ].concat(calls).concat([
            [setLoadingState(false)]
        ]));
    }

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

    describe('#oAuthValidate()', () => {
        let resp;

        beforeEach(() => {
            resp = {
                client: {id: 123},
                oAuth: {state: 123},
                session: {
                    scopes: ['scopes']
                }
            };

            request.get.returns(Promise.resolve(resp));
        });

        it('should send get request to an api', () =>
            callThunk(oAuthValidate, oauthData).then(() => {
                expect(request.get, 'to have a call satisfying', ['/api/oauth2/v1/validate', {}]);
            })
        );

        it('should dispatch setClient, setOAuthRequest and setScopes', () =>
            callThunk(oAuthValidate, oauthData).then(() => {
                expectDispatchCalls([
                    [setClient(resp.client)],
                    [setOAuthRequest({
                        ...resp.oAuth,
                        prompt: 'none',
                        loginHint: undefined
                    })],
                    [setScopes(resp.session.scopes)]
                ]);
            })
        );
    });

    describe('#oAuthComplete()', () => {
        beforeEach(() => {
            getState.returns({
                auth: {
                    oauth: oauthData
                }
            });
        });

        it('should post to api/oauth2/complete', () => {
            request.post.returns(Promise.resolve({
                redirectUri: ''
            }));

            return callThunk(oAuthComplete).then(() => {
                expect(request.post, 'to have a call satisfying', [
                    '/api/oauth2/v1/complete?client_id=&redirect_uri=&response_type=&description=&scope=&prompt=&login_hint=&state=',
                    {}
                ]);
            });
        });

        it('should dispatch setOAuthCode for static_page redirect', () => {
            const resp = {
                success: true,
                redirectUri: 'static_page?code=123&state='
            };

            request.post.returns(Promise.resolve(resp));

            return callThunk(oAuthComplete).then(() => {
                expectDispatchCalls([
                    [
                        setOAuthCode({
                            success: true,
                            code: '123',
                            displayCode: false
                        })
                    ]
                ]);
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
                expect(resp, 'to equal', {
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
                expect(resp.acceptRequired, 'to be true');
                expectDispatchCalls([
                    [requirePermissionsAccept()]
                ]);
            });
        });
    });

    describe('#login()', () => {
        describe('when correct login was entered', () => {
            beforeEach(() => {
                request.post.returns(Promise.reject({
                    errors: {
                        password: 'error.password_required'
                    }
                }));
            });

            it('should set login', () =>
                callThunk(login, {login: 'foo'}).then(() => {
                    expectDispatchCalls([
                        [setLogin('foo')]
                    ]);
                })
            );
        });
    });
});
