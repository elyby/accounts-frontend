import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';
import RecoverPasswordState from 'services/authFlow/RecoverPasswordState';
import CompleteState from 'services/authFlow/CompleteState';
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
        it('should navigate to /forgot-password if email set', () => {
            context.getState.returns({
                user: {isGuest: true, email: 'foo@bar.com'}
            });

            expectNavigate(mock, '/forgot-password');

            state.enter(context);
        });

        it('should navigate to /forgot-password if username set', () => {
            context.getState.returns({
                user: {isGuest: true, username: 'foobar'}
            });

            expectNavigate(mock, '/forgot-password');

            state.enter(context);
        });

        it('should transition to complete if not guest', () => {
            context.getState.returns({
                user: {isGuest: false}
            });

            expectState(mock, CompleteState);

            state.enter(context);
        });

        it('should transition to login if no identity', () => {
            context.getState.returns({
                user: {isGuest: true}
            });

            expectState(mock, LoginState);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call forgotPassword with email', () => {
            const expectedLogin = 'foo@bar.com';
            context.getState.returns({
                user: {
                    email: expectedLogin
                }
            });

            expectRun(
                mock,
                'forgotPassword',
                sinon.match({
                    login: expectedLogin
                })
            ).returns({then() {}});

            state.resolve(context, {});
        });

        it('should call forgotPassword with username', () => {
            const expectedLogin = 'foobar';
            context.getState.returns({
                user: {
                    username: expectedLogin
                }
            });

            expectRun(
                mock,
                'forgotPassword',
                sinon.match({
                    login: expectedLogin
                })
            ).returns({then() {}});

            state.resolve(context, {});
        });

        it('should transition to recoverPassword state on success', () => {
            const promise = Promise.resolve();
            const expectedLogin = 'foo@bar.com';
            context.getState.returns({
                user: {
                    email: expectedLogin
                }
            });

            mock.expects('run').returns(promise);
            expectState(mock, RecoverPasswordState);

            state.resolve(context, {});

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
