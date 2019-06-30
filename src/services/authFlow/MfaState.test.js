import expect from 'test/unexpected';
import sinon from 'sinon';

import MfaState from './MfaState';
import CompleteState from 'services/authFlow/CompleteState';
import PasswordState from 'services/authFlow/PasswordState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('MfaState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new MfaState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /mfa', () => {
            context.getState.returns({
                auth: {
                    credentials: {
                        login: 'foo',
                        password: 'bar',
                        isTotpRequired: true
                    }
                }
            });

            expectNavigate(mock, '/mfa');

            state.enter(context);
        });

        it('should transition to complete if no totp required', () => {
            context.getState.returns({
                auth: {
                    credentials: {
                        login: 'foo',
                        password: 'bar'
                    }
                }
            });

            expectState(mock, CompleteState);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call login with login and password', () => {
            const expectedLogin = 'foo';
            const expectedPassword = 'bar';
            const expectedTotp = '111222';
            const expectedRememberMe = true;

            context.getState.returns({
                auth: {
                    credentials: {
                        login: expectedLogin,
                        password: expectedPassword,
                        rememberMe: expectedRememberMe
                    }
                }
            });

            expectRun(
                mock,
                'login',
                sinon.match({
                    totp: expectedTotp,
                    login: expectedLogin,
                    password: expectedPassword,
                    rememberMe: expectedRememberMe
                })
            ).returns(Promise.resolve());
            expectState(mock, CompleteState);

            const payload = {totp: expectedTotp};

            return expect(state.resolve(context, payload), 'to be fulfilled');
        });
    });

    describe('#goBack', () => {
        it('should transition to login state', () => {
            expectState(mock, PasswordState);

            state.goBack(context);
        });
    });
});
