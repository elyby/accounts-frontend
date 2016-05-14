import RecoverPasswordState from 'services/authFlow/RecoverPasswordState';
import CompleteState from 'services/authFlow/CompleteState';
import LoginState from 'services/authFlow/LoginState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('RecoverPasswordState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new RecoverPasswordState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /recover-password', () => {
            const expectedPath = '/recover-password';
            context.getState.returns({
                user: {isGuest: true},
                routing: {
                    location: {pathname: expectedPath}
                }
            });

            expectNavigate(mock, expectedPath);

            state.enter(context);
        });

        it('should navigate to /recover-password/key', () => {
            const expectedPath = '/recover-password/sasx5AS4d61';
            context.getState.returns({
                user: {isGuest: true},
                routing: {
                    location: {pathname: expectedPath}
                }
            });

            expectNavigate(mock, expectedPath);

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
        it('should call recoverPassword with provided payload', () => {
            const expectedPayload = {key: 123, newPassword: '123', newRePassword: '123'};

            expectRun(
                mock,
                'recoverPassword',
                sinon.match(expectedPayload)
            ).returns({then() {}});

            state.resolve(context, expectedPayload);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context, {});

            return promise;
        });
    });

    describe('#reject', () => {
        it('should navigate to /send-message', () => {
            expectNavigate(mock, '/send-message');

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
