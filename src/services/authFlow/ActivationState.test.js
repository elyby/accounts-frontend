import sinon from 'sinon';

import ActivationState from 'services/authFlow/ActivationState';
import CompleteState from 'services/authFlow/CompleteState';
import ResendActivationState from 'services/authFlow/ResendActivationState';

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
            const expectedPath = '/activation';
            context.getState.returns({
                user: {
                    isActive: false
                }
            });

            context.getRequest.returns({path: expectedPath});

            expectNavigate(mock, '/activation');

            state.enter(context);
        });

        it('should navigate to /activation/key', () => {
            const expectedPath = '/activation/sasx5AS4d61';
            context.getState.returns({
                user: {
                    isActive: false
                }
            });

            context.getRequest.returns({path: expectedPath});

            expectNavigate(mock, expectedPath);

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
            ).returns(Promise.resolve());

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

    describe('#reject', () => {
        it('should transition to resend-activation', () => {
            expectState(mock, ResendActivationState);

            state.reject(context);
        });
    });
});
