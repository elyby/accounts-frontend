import PasswordState from 'services/authFlow/PasswordState';
import CompleteState from 'services/authFlow/CompleteState';
import LoginState from 'services/authFlow/LoginState';
import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('PasswordState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new PasswordState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /password', () => {
            context.getState.returns({
                user: {isGuest: true}
            });

            expectNavigate(mock, '/password');

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
        (() => {
            const expectedLogin = 'login';
            const expectedPassword = 'password';

            const testWith = (user) => {
                it(`should call login with email or username and password. User: ${JSON.stringify(user)}`, () => {
                    context.getState.returns({user});

                    expectRun(
                        mock,
                        'login',
                        sinon.match({
                            login: expectedLogin,
                            password: expectedPassword
                        })
                    ).returns({then() {}});

                    state.resolve(context, {password: expectedPassword});
                });
            };

            testWith({
                email: expectedLogin
            });

            testWith({
                username: expectedLogin
            });

            testWith({
                email: expectedLogin,
                username: expectedLogin
            });
        });

        it('should transition to complete state on successfull login', () => {
            const promise = Promise.resolve();
            const expectedLogin = 'login';
            const expectedPassword = 'password';

            context.getState.returns({
                user: {
                    email: expectedLogin
                }
            });

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context, {password: expectedPassword});

            return promise;
        });
    });

    describe('#reject', () => {
        it('should transition to forgot password state', () => {
            expectState(mock, ForgotPasswordState);

            state.reject(context);
        });
    });

    describe('#goBack', () => {
        it('should transition to forgot password state', () => {
            expectRun(mock, 'logout');
            expectState(mock, LoginState);

            state.goBack(context);
        });
    });
});
