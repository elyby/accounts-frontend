import sinon, { SinonMock } from 'sinon';

import InitOAuthAuthCodeFlowState from './InitOAuthAuthCodeFlowState';
import CompleteState from 'app/services/authFlow/CompleteState';

import { bootstrap, expectState, expectRun, MockedAuthContext } from './helpers';

describe('OAuthState', () => {
    let state: InitOAuthAuthCodeFlowState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    beforeEach(() => {
        state = new InitOAuthAuthCodeFlowState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should run oAuthValidate', () => {
            const query = {
                client_id: 'client_id',
                redirect_uri: 'redirect_uri',
                response_type: 'response_type',
                description: 'description',
                scope: 'scope1 scope2',
                code_challenge: 'code_challenge',
                code_challenge_method: 'S256',
                prompt: 'none',
                login_hint: '1',
                state: 'state',
            };

            context.getRequest.returns({
                query: new URLSearchParams(query),
                params: {},
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        clientId: query.client_id,
                        redirectUrl: query.redirect_uri,
                        responseType: query.response_type,
                        scope: query.scope,
                        state: query.state,
                        code_challenge: query.code_challenge,
                        code_challenge_method: query.code_challenge_method,
                    },
                    description: query.description,
                    prompt: query.prompt,
                    loginHint: query.login_hint,
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should support clientId through route params', () => {
            const clientId = 'client_id';
            const query = {
                redirect_uri: 'redirect_uri',
                response_type: 'response_type',
                scope: 'scope1 scope2',
                state: 'state',
            };

            context.getRequest.returns({
                query: new URLSearchParams(query),
                params: { clientId },
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        clientId,
                        redirectUrl: query.redirect_uri,
                        responseType: query.response_type,
                        scope: query.scope,
                        state: query.state,
                    },
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should give preference to client_id from query', () => {
            const clientId = 'wrong_id';
            const query = {
                client_id: 'client_id',
                redirect_uri: 'redirect_uri',
                response_type: 'response_type',
                scope: 'scope1 scope2',
                state: 'state',
            };

            context.getRequest.returns({
                query: new URLSearchParams(query),
                params: { clientId },
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        clientId: query.client_id,
                        redirectUrl: query.redirect_uri,
                        responseType: query.response_type,
                        scope: query.scope,
                        state: query.state,
                    },
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should replace commas with spaces in scope param', () => {
            const query = {
                client_id: 'client_id',
                redirect_uri: 'redirect_uri',
                response_type: 'response_type',
                scope: 'scope1,scope2,scope3',
                state: 'state',
            };

            context.getRequest.returns({
                query: new URLSearchParams(query),
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        clientId: query.client_id,
                        redirectUrl: query.redirect_uri,
                        responseType: query.response_type,
                        scope: 'scope1 scope2 scope3',
                        state: query.state,
                    },
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            context.getRequest.returns({ query: new URLSearchParams(), params: {} });

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.enter(context);

            return promise;
        });
    });
});
