import ActivationState from 'services/authFlow/ActivationState';
import CompleteState from 'services/authFlow/CompleteState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('ActivationState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new ActivationState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /activation', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                    isActive: false
                }
            });

            expectNavigate(mock, '/activation');

            state.enter(context);
        });

        it('should transition to complete state if account activated', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                    isActive: true
                }
            });

            expectState(mock, CompleteState);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call activate with payload', () => {
            const payload = {};

            expectRun(
                mock,
                'activate',
                sinon.match.same(payload)
            ).returns({then() {}});

            state.resolve(context, payload);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context);

            return promise;
        });

        it('should NOT transition to complete state on fail', () => {
            const promise = Promise.reject();

            mock.expects('run').returns(promise);
            mock.expects('setState').never();

            state.resolve(context);

            return promise.catch(mock.verify.bind(mock));
        });
    });
});
