import sinon from 'sinon';

import RegisterState from 'services/authFlow/RegisterState';
import CompleteState from 'services/authFlow/CompleteState';
import ActivationState from 'services/authFlow/ActivationState';
import ResendActivationState from 'services/authFlow/ResendActivationState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('RegisterState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new RegisterState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /register', () => {
            context.getState.returns({
                user: {isGuest: true}
            });

            expectNavigate(mock, '/register');

            state.enter(context);
        });

        it('should transition to complete if not guest', () => {
            context.getState.returns({
                user: {isGuest: false}
            });

            expectState(mock, CompleteState);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should register on resolve', () => {
            const payload = {};

            expectRun(
                mock,
                'register',
                sinon.match.same(payload)
            ).returns(Promise.resolve());

            state.resolve(context, payload);
        });

        it('should transition to complete after register', () => {
            const payload = {};
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context, payload);

            return promise;
        });

        it('should NOT transition to complete if register fails', () => {
            const promise = Promise.reject();

            mock.expects('run').returns(promise);
            mock.expects('setState').never();

            state.resolve(context);

            return promise.catch(mock.verify.bind(mock));
        });
    });

    describe('#reject', () => {
        it('should transition to activation', () => {
            expectState(mock, ActivationState);

            state.reject(context, {});
        });

        it('should transition to resend-activation', () => {
            expectState(mock, ResendActivationState);

            state.reject(context, {requestEmail: true});
        });
    });
});
