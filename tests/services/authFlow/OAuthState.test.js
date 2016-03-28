import OAuthState from 'services/authFlow/OAuthState';
import CompleteState from 'services/authFlow/CompleteState';

import { bootstrap, expectState, expectRun } from './helpers';

describe('OAuthState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new OAuthState();

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
                scope: 'scope',
                state: 'state'
            };

            context.getState.returns({
                routing: {location: {query}}
            });

            expectRun(
                mock,
                'oAuthValidate',
                sinon.match({
                    clientId: query.client_id,
                    redirectUrl: query.redirect_uri,
                    responseType: query.response_type,
                    scope: query.scope,
                    state: query.state
                })
            ).returns({then() {}});

            state.enter(context);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            context.getState.returns({
                routing: {location: {query: {}}}
            });

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.enter(context);

            return promise;
        });
    });
});