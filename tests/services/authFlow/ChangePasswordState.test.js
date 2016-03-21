import ChangePasswordState from 'services/authFlow/ChangePasswordState';
import CompleteState from 'services/authFlow/CompleteState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('ChangePasswordState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new ChangePasswordState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /change-password', () => {
            context.getState.returns({
                user: {isGuest: true}
            });

            expectNavigate(mock, '/change-password');

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call changePassword with payload', () => {
            const payload = {};

            expectRun(
                mock,
                'changePassword',
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

    describe('#reject', () => {
        it('should transition to complete state and mark that password should not be changed', () => {
            expectRun(
                mock,
                'updateUser',
                sinon.match({
                    shouldChangePassword: false
                })
            );

            expectState(mock, CompleteState);

            state.reject(context);
        });
    });
});
