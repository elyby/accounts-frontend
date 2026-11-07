import { Action as ReduxAction } from 'redux';
import sinon from 'sinon';
import expect from 'app/test/unexpected';

// Stub the functions in the module itself: the index re-exports them as getters, which sinon can't replace
import * as request from 'app/services/request/request';

import {
    setLoadingState,
    oAuthValidate,
    oAuthComplete,
    oAuthRedirectError,
    setClient,
    setOAuthRequest,
    setScopes,
    requirePermissionsAccept,
    login,
    setLogin,
} from 'app/components/auth/actions';
import { OAuthValidateResponse } from 'app/services/api/oauth';
import { OAuthError, ValidationError } from 'app/services/request';

import { OAuthState } from './reducer';

const oauthQuery: Record<string, string> = {
    client_id: 'client',
    redirect_uri: 'http://127.0.0.1:8080/cb',
    response_type: 'code',
    scope: 'openid profile',
    state: 'state',
    code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    code_challenge_method: 'S256',
    nonce: ' nonce ',
    request: '',
    unknown_param: 'value',
};

const oauthData: OAuthState = {
    params: {
        query: oauthQuery,
    },
    prompt: 'none',
};

describe('components/auth/actions', () => {
    const dispatch = sinon.stub().named('store.dispatch');
    const getState = sinon.stub().named('store.getState');

    function callThunk<A extends Array<any>, F extends (...args: A) => any>(fn: F, ...args: A): Promise<void> {
        const thunk = fn(...args);

        return thunk(dispatch, getState);
    }

    function expectDispatchCalls(calls: Array<Array<ReduxAction>>) {
        expect(dispatch, 'to have calls satisfying', [[setLoadingState(true)], ...calls, [setLoadingState(false)]]);
    }

    beforeEach(() => {
        dispatch.reset();
        getState.reset();
        getState.returns({});
        sinon.stub(request, 'get').named('request.get');
        sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
        (request.get as any).restore();
        (request.post as any).restore();
    });

    describe('#oAuthValidate()', () => {
        let resp: OAuthValidateResponse;

        beforeEach(() => {
            resp = {
                oAuth: {
                    redirect_uri: 'http://127.0.0.1:8080/cb?state=state&iss=https%3A%2F%2Faccount.ely.by',
                },
                client: {
                    id: '123',
                    name: '',
                    description: '',
                },
                session: {
                    scopes: ['account_info'],
                },
            };

            (request.get as any).returns(Promise.resolve(resp));
        });

        for (const [title, prompt] of [
            ['space delimited', 'select_account consent'],
            ['comma separated', 'select_account,consent'],
            ['mixed with extra delimiters', ' select_account, consent '],
        ]) {
            it(`should split the ${title} prompt values`, async () => {
                await callThunk(oAuthValidate, { ...oauthData, prompt });

                expect(dispatch, 'to have a call satisfying', [
                    { type: 'set_oauth', payload: { prompt: ['select_account', 'consent'] } },
                ]);
            });
        }

        it('should pass the query to the api as is', async () => {
            await callThunk(oAuthValidate, oauthData);

            expect(request.get, 'to have a call exhaustively satisfying', [
                '/api/oauth2/v1/validate',
                oauthQuery,
            ]);
        });

        it('should pass the device code flow user code', async () => {
            await callThunk(oAuthValidate, { params: { userCode: 'USERCODE' } });

            expect(request.get, 'to have a call exhaustively satisfying', [
                '/api/oauth2/v1/validate',
                { user_code: 'USERCODE' },
            ]);
        });

        describe('when the request is invalid', () => {
            it('should redirect the user to the client when the error has the redirect uri', async () => {
                const error = new OAuthError(new Response('{}', { status: 400 }), {
                    error: 'request_not_supported',
                    error_description: 'The request parameter is not supported.',
                    redirectUri: 'https://example.com/cb?error=request_not_supported&state=state',
                });
                (request.get as any).returns(Promise.reject(error));
                // The redirect never resolves, since the page is unloaded
                dispatch.withArgs(sinon.match.func).returns(new Promise(() => {}));

                const result = await Promise.race([
                    callThunk(oAuthValidate, oauthData).then(
                        () => 'resolved',
                        () => 'rejected',
                    ),
                    new Promise((resolve) => setTimeout(() => resolve('pending'), 10)),
                ]);

                expect(result, 'to equal', 'pending');
                expect(dispatch, 'to have a call satisfying', [expect.it('to be a function')]);
            });

            it('should reject when the error has no redirect uri', async () => {
                const error = new OAuthError(new Response('{}', { status: 400 }), {
                    // The error without a user message, so no alert is shown
                    error: 'server_error',
                });
                (request.get as any).returns(Promise.reject(error));

                await expect(callThunk(oAuthValidate, oauthData), 'to be rejected with', error);
                expect(dispatch, 'to have no calls satisfying', [expect.it('to be a function')]);
            });
        });

        it('should dispatch setClient, setOAuthRequest and setScopes', () =>
            callThunk(oAuthValidate, oauthData).then(() => {
                expectDispatchCalls([
                    [setClient(resp.client)],
                    [
                        setOAuthRequest({
                            params: oauthData.params,
                            prompt: ['none'],
                            loginHint: undefined,
                            redirectUri: resp.oAuth.redirect_uri,
                        }),
                    ],
                    [setScopes(resp.session.scopes)],
                ]);
            }));

        it('should drop prompt=none, when there is no address to return an error to', async () => {
            // e.g. the device code flow
            delete resp.oAuth.redirect_uri;

            await callThunk(oAuthValidate, { params: { userCode: 'USERCODE' }, prompt: 'none consent' });

            expect(dispatch, 'to have a call satisfying', [{ type: 'set_oauth', payload: { prompt: ['consent'] } }]);
        });

        describe('oauthData persistence', () => {
            beforeEach(() => window.localStorage.removeItem('oauthData'));

            it('should store the request to restore it later', async () => {
                await callThunk(oAuthValidate, { ...oauthData, prompt: 'consent' });

                expect(window.localStorage.getItem('oauthData'), 'not to be null');
            });

            it('should not store the silent request', async () => {
                await callThunk(oAuthValidate, { ...oauthData, prompt: 'none' });

                expect(window.localStorage.getItem('oauthData'), 'to be null');
            });
        });
    });

    describe('#oAuthRedirectError()', () => {
        it('should redirect the user to the client, when the error redirect uri is known', async () => {
            getState.returns({
                auth: {
                    oauth: {
                        ...oauthData,
                        redirectUri: 'http://127.0.0.1:8080/cb?state=state&iss=https%3A%2F%2Faccount.ely.by',
                    },
                },
            });
            // The redirect never resolves, since the page is unloaded
            dispatch.withArgs(sinon.match.func).returns(new Promise(() => {}));

            const result = await Promise.race([
                callThunk(oAuthRedirectError, 'login_required').then(() => 'resolved'),
                new Promise((resolve) => setTimeout(() => resolve('pending'), 10)),
            ]);

            expect(result, 'to equal', 'pending');
            expect(dispatch, 'to have a call satisfying', [expect.it('to be a function')]);
        });

        it('should show the error and reset the oauth request, when there is no error redirect uri', async () => {
            const clock = sinon.useFakeTimers();
            const alert = sinon.stub(window, 'alert');

            try {
                getState.returns({ auth: { oauth: oauthData } });
                // resetOAuth is a thunk, so run it to get the actual actions
                dispatch.withArgs(sinon.match.func).callsFake((thunk) => thunk(dispatch, getState));

                await callThunk(oAuthRedirectError, 'login_required');
                clock.tick(500);

                expect(dispatch, 'to have a call satisfying', [setOAuthRequest(null)]);
                expect(alert, 'to have a call satisfying', [expect.it('to contain', 'login_required')]);
            } finally {
                alert.restore();
                clock.restore();
            }
        });
    });

    describe('#oAuthComplete()', () => {
        beforeEach(() => {
            getState.returns({
                auth: {
                    oauth: oauthData,
                },
            });
        });

        it('should post the query to api/oauth2/complete as is', async () => {
            (request.post as any).returns(Promise.resolve({ success: true, redirectUri: 'https://example.com' }));

            await callThunk(oAuthComplete);

            expect(request.post, 'to have a call exhaustively satisfying', [
                '/api/oauth2/v1/complete',
                {},
                { searchParams: oauthQuery },
            ]);
        });


        it('should resolve to with success false and redirectUri for access_denied', async () => {
            const resp = new OAuthError(new Response('{}', { status: 401 }), {
                error: 'access_denied',
                redirectUri: 'redirectUri',
            });

            (request.post as any).returns(Promise.reject(resp));

            const data = await callThunk(oAuthComplete);

            expect(data, 'to satisfy', {
                success: false,
                redirectUri: 'redirectUri',
            });
        });

        it('should dispatch requirePermissionsAccept if accept_required', () => {
            const resp = new OAuthError(new Response('{}', { status: 401 }), {
                error: 'accept_required',
            });

            (request.post as any).returns(Promise.reject(resp));

            return callThunk(oAuthComplete).catch((error) => {
                expect(error, 'to be', resp);
                expectDispatchCalls([[requirePermissionsAccept()]]);
            });
        });
    });

    describe('#login()', () => {
        describe('when correct login was entered', () => {
            beforeEach(() => {
                (request.post as any).returns(
                    Promise.reject(
                        new ValidationError(new Response('{}'), {
                            success: false,
                            errors: {
                                password: 'error.password_incorrect',
                            },
                        }),
                    ),
                );
            });

            it('should set login', () =>
                callThunk(login, { login: 'foo' }).then(() => {
                    expectDispatchCalls([[setLogin('foo')]]);
                }));
        });
    });
});
