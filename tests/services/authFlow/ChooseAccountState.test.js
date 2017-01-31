import ChooseAccountState from 'services/authFlow/ChooseAccountState';
import CompleteState from 'services/authFlow/CompleteState';
import LoginState from 'services/authFlow/LoginState';
import RegisterState from 'services/authFlow/RegisterState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('ChooseAccountState', () => {
    let state;
    let context;
    let mock;

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
            expectNavigate(mock, '/oauth/choose-account');

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should transition to complete if existed account was choosen', () => {
            expectState(mock, CompleteState);

            state.resolve(context, {id: 123});
        });

        it('should transition to login if user wants to add new account', () => {
            expectNavigate(mock, '/login');
            expectState(mock, LoginState);

            state.resolve(context, {});
        });
    });

    describe('#reject', () => {
        it('should transition to register', () => {
            expectState(mock, RegisterState);

            state.reject(context);
        });

        it('should logout', () => {
            expectRun(mock, 'logout');

            state.reject(context, {logout: true});
        });
    });
});
