import { Action as ReduxAction } from 'redux';
import sinon from 'sinon';
import expect from 'app/test/unexpected';

import request from 'app/services/request';

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
import { OauthData, OAuthValidateResponse } from '../../services/api/oauth';

const oauthData: OauthData = {
    clientId: '',
    redirectUrl: '',
    responseType: '',
    scope: '',
    state: '',
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
                oAuth: {
                    state: 123,
                },
                session: {
                    scopes: ['account_info'],
                },
            };

            (request.get as any).returns(Promise.resolve(resp));
        });

        it('should send get request to an api', () =>
            callThunk(oAuthValidate, oauthData).then(() => {
                expect(request.get, 'to have a call satisfying', ['/api/oauth2/v1/validate', {}]);
            }));

        it('should dispatch setClient, setOAuthRequest and setScopes', () =>
            callThunk(oAuthValidate, oauthData).then(() => {
                expectDispatchCalls([
                    [setClient(resp.client)],
                    [
                        setOAuthRequest({
                            ...resp.oAuth,
                            prompt: 'none',
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

        it('should post to api/oauth2/complete', () => {
            (request.post as any).returns(
                Promise.resolve({
                    redirectUri: '',
                }),
            );

            return callThunk(oAuthComplete).then(() => {
                expect(request.post, 'to have a call satisfying', [
                    '/api/oauth2/v1/complete?client_id=&redirect_uri=&response_type=&description=&scope=&prompt=none&login_hint=&state=',
                    {},
                ]);
            });
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
            const resp = {
                statusCode: 401,
                error: 'access_denied',
                redirectUri: 'redirectUri',
            };

            (request.post as any).returns(Promise.reject(resp));

            const data = await callThunk(oAuthComplete);

            expect(data, 'to equal', {
                success: false,
                redirectUri: 'redirectUri',
            });
        });

        it('should dispatch requirePermissionsAccept if accept_required', () => {
            const resp = {
                statusCode: 401,
                error: 'accept_required',
            };

            (request.post as any).returns(Promise.reject(resp));

            return callThunk(oAuthComplete).catch((error) => {
                expect(error.acceptRequired, 'to be true');
                expectDispatchCalls([[requirePermissionsAccept()]]);
            });
        });
    });

    describe('#login()', () => {
        describe('when correct login was entered', () => {
            beforeEach(() => {
                (request.post as any).returns(
                    Promise.reject({
                        errors: {
                            password: 'error.password_required',
                        },
                    }),
                );
            });

            it('should set login', () =>
                callThunk(login, { login: 'foo' }).then(() => {
                    expectDispatchCalls([[setLogin('foo')]]);
                }));
        });
    });
});
