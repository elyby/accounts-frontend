import { Action as ReduxAction } from 'redux';
import sinon from 'sinon';
import expect from 'app/test/unexpected';

// Stub the functions in the module itself: the index re-exports them as getters, which sinon can't replace
import * as request from 'app/services/request/request';

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
                    success: false,
                    error: 'request_not_supported',
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
                    success: false,
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
                        }),
                    ],
                    [setScopes(resp.session.scopes)],
                ]);
            }));
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

        it('should dispatch setOAuthCode for static_page redirect', () => {
            const resp = {
                success: true,
                redirectUri: 'static_page?code=123&state=',
            };

            (request.post as any).returns(Promise.resolve(resp));

            return callThunk(oAuthComplete).then(() => {
                expectDispatchCalls([
                    [
                        setOAuthCode({
                            success: true,
                            code: '123',
                            displayCode: false,
                        }),
                    ],
                ]);
            });
        });

        it('should resolve to with success false and redirectUri for access_denied', async () => {
            const resp = new OAuthError(new Response('{}', { status: 401 }), {
                statusCode: 401,
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
                statusCode: 401,
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
