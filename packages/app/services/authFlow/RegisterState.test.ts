import sinon, { SinonMock } from 'sinon';

import RegisterState from 'app/services/authFlow/RegisterState';
import CompleteState from 'app/services/authFlow/CompleteState';
import ActivationState from 'app/services/authFlow/ActivationState';
import ResendActivationState from 'app/services/authFlow/ResendActivationState';

import { bootstrap, expectState, expectNavigate, expectRun, MockedAuthContext } from './helpers';

describe('RegisterState', () => {
    let state: RegisterState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    const mockPayload = {
        username: '',
        email: '',
        password: '',
        rePassword: '',
        rulesAgreement: true,
        captcha: '',
    };

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
                user: { isGuest: true },
            });

            expectNavigate(mock, '/register');

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should register on resolve', () => {
            expectRun(mock, 'register', sinon.match.same(mockPayload)).returns(new Promise(() => {}));

            state.resolve(context, mockPayload);
        });

        it('should transition to complete after register', () => {
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context, mockPayload);

            return promise;
        });

        it('should NOT transition to complete if register fails', () => {
            const promise = Promise.reject();

            mock.expects('run').returns(promise);
            mock.expects('setState').never();

            state.resolve(context, mockPayload);

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

            state.reject(context, { requestEmail: true });
        });
    });
});
