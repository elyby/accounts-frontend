import sinon, { SinonMock } from 'sinon';

import ResendActivationState from 'app/services/authFlow/ResendActivationState';
import ActivationState from 'app/services/authFlow/ActivationState';
import RegisterState from 'app/services/authFlow/RegisterState';

import { bootstrap, expectState, expectNavigate, expectRun, MockedAuthContext } from './helpers';

describe('ResendActivationState', () => {
    let state: ResendActivationState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    const mockPayload = {
        email: 'foo@bar.com',
        captcha: '',
    };

    beforeEach(() => {
        state = new ResendActivationState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /resend-activation', () => {
            context.getState.returns({
                user: {
                    isActive: false,
                },
            });

            expectNavigate(mock, '/resend-activation');

            state.enter(context);
        });

        it('should navigate to /resend-activation for guests', () => {
            context.getState.returns({
                user: {
                    isGuest: true,
                    isActive: false,
                },
            });

            expectNavigate(mock, '/resend-activation');

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call resendActivation with payload', () => {
            expectRun(mock, 'resendActivation', sinon.match.same(mockPayload)).returns(new Promise(() => {}));

            state.resolve(context, mockPayload);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, ActivationState);

            state.resolve(context, mockPayload);

            return promise;
        });

        it('should NOT transition to complete state on fail', () => {
            const promise = Promise.reject();

            mock.expects('run').returns(promise);
            mock.expects('setState').never();

            state.resolve(context, mockPayload);

            return promise.catch(mock.verify.bind(mock));
        });
    });

    describe('#reject', () => {
        it('should transition to activate state on reject', () => {
            expectState(mock, ActivationState);

            state.reject(context);
        });
    });

    describe('#goBack', () => {
        it('should transition to activation', () => {
            expectState(mock, ActivationState);

            state.goBack(context);
        });

        it('should transition to register if it was active previousely', () => {
            expectState(mock, RegisterState);

            context.prevState = new RegisterState();
            state.goBack(context);
        });
    });
});
