import ChooseAccountState from 'app/services/authFlow/ChooseAccountState';
import CompleteState from 'app/services/authFlow/CompleteState';
import LoginState from 'app/services/authFlow/LoginState';

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
    it('should transition to complete if existed account was choosen', () => {
      expectState(mock, CompleteState);

      state.resolve(context, { id: 123 });
    });

    it('should transition to login if user wants to add new account', () => {
      expectNavigate(mock, '/login');
      expectRun(mock, 'setLogin', null);
      expectState(mock, LoginState);

      state.resolve(context, {});
    });
  });

  describe('#reject', () => {
    it('should logout', () => {
      expectRun(mock, 'logout');

      state.reject(context);
    });
  });
});
