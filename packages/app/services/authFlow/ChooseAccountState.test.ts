import expect from 'app/test/unexpected';
import sinon, { SinonMock } from 'sinon';

import ChooseAccountState from 'app/services/authFlow/ChooseAccountState';
import CompleteState from 'app/services/authFlow/CompleteState';
import LoginState from 'app/services/authFlow/LoginState';

import { bootstrap, expectState, expectNavigate, expectRun, MockedAuthContext } from './helpers';

describe('ChooseAccountState', () => {
    let state: ChooseAccountState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    beforeEach(() => {
        state = new ChooseAccountState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /oauth/choose-account', () => {
            context.getState.returns({
                auth: {
                    oauth: {},
                },
            });

            expectNavigate(mock, '/oauth/choose-account');

            state.enter(context);
        });

        it('should navigate to /choose-account if not oauth', () => {
            context.getState.returns({
                auth: {
                    oauth: null,
                },
            });

            expectNavigate(mock, '/choose-account');

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should transition to complete if an existing account was chosen', () => {
            expectRun(
                mock,
                'authenticate',
                sinon.match({
                    id: 123,
                }),
            ).returns(Promise.resolve());
            expectRun(mock, 'setAccountSwitcher', false);
            expectState(mock, CompleteState);

            return expect(state.resolve(context, { id: 123 }), 'to be fulfilled');
        });

        it('should transition to login if user wants to add new account', () => {
            expectNavigate(mock, '/login');
            expectRun(mock, 'setLogin', null);
            expectState(mock, LoginState);

            // Assert nothing returned
            return expect(state.resolve(context, {}), 'to be undefined');
        });
    });

    describe('#reject', () => {
        it('should logout', () => {
            expectRun(mock, 'logout');

            state.reject(context);
        });
    });
});
