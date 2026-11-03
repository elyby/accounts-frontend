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
        it('should run oAuthValidate with the whole query', () => {
            const query = {
                client_id: 'client_id',
                redirect_uri: 'redirect_uri',
                response_type: 'response_type',
                description: 'description',
                scope: 'scope1 scope2',
                code_challenge: 'code_challenge',
                code_challenge_method: 'S256',
                nonce: ' nonce ',
                request: '',
                unknown_param: 'value',
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
                        query: sinon.match(query),
                    },
                    description: query.description,
                    prompt: query.prompt,
                    loginHint: query.login_hint,
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should not add the absent params', () => {
            context.getRequest.returns({
                query: new URLSearchParams({ client_id: 'client_id' }),
                params: {},
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match(
                    ({ params }) => JSON.stringify(params.query) === JSON.stringify({ client_id: 'client_id' }),
                    'only the passed params',
                ),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should support clientId through route params', () => {
            context.getRequest.returns({
                query: new URLSearchParams({ state: 'state' }),
                params: { clientId: 'client_id' },
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        query: { client_id: 'client_id', state: 'state' },
                    },
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should give preference to client_id from query', () => {
            context.getRequest.returns({
                query: new URLSearchParams({ client_id: 'client_id' }),
                params: { clientId: 'wrong_id' },
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        query: { client_id: 'client_id' },
                    },
                }),
            ).returns({ then() {} });

            state.enter(context);
        });

        it('should replace commas with spaces in scope param', () => {
            context.getRequest.returns({
                query: new URLSearchParams({ client_id: 'client_id', scope: 'scope1,scope2,scope3' }),
                params: {},
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    params: {
                        query: { scope: 'scope1 scope2 scope3' },
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
