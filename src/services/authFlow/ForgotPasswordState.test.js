import sinon from 'sinon';

import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';
import RecoverPasswordState from 'services/authFlow/RecoverPasswordState';
import LoginState from 'services/authFlow/LoginState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('ForgotPasswordState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new ForgotPasswordState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /forgot-password if login set', () => {
            expectNavigate(mock, '/forgot-password');

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call forgotPassword with email from payload', () => {
            const expectedLogin = 'foo@bar.com';

            expectRun(
                mock,
                'forgotPassword',
                sinon.match({
                    login: expectedLogin
                })
            ).returns(Promise.resolve());

            state.resolve(context, {login: expectedLogin});
        });

        it('should transition to recoverPassword state on success', () => {
            const promise = Promise.resolve();
            const expectedLogin = 'foo@bar.com';

            mock.expects('run').twice().returns(promise);
            expectState(mock, RecoverPasswordState);

            state.resolve(context, {login: expectedLogin});

            return promise;
        });

        it('should run setLogin on success', () => {
            const promise = Promise.resolve();
            const expectedLogin = 'foo@bar.com';

            mock.expects('run').withArgs('forgotPassword').returns(promise);
            expectState(mock, RecoverPasswordState);
            mock.expects('run').withArgs('setLogin', expectedLogin);

            state.resolve(context, {login: expectedLogin});

            return promise;
        });
    });

    describe('#reject', () => {
        it('should navigate to /send-message', () => {
            expectState(mock, RecoverPasswordState);

            state.reject(context);
        });
    });

    describe('#goBack', () => {
        it('should transition to login state', () => {
            expectState(mock, LoginState);

            state.goBack(context);
        });
    });
});
