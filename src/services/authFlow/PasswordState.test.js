import expect from 'test/unexpected';
import sinon from 'sinon';

import PasswordState from 'services/authFlow/PasswordState';
import CompleteState from 'services/authFlow/CompleteState';
import MfaState from 'services/authFlow/MfaState';
import LoginState from 'services/authFlow/LoginState';
import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';
import ChooseAccountState from 'services/authFlow/ChooseAccountState';

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
        user: { isGuest: true },
        auth: {
          credentials: { login: 'foo' },
        },
      });

      expectNavigate(mock, '/password');

      state.enter(context);
    });

    it('should transition to complete if not guest', () => {
      context.getState.returns({
        user: { isGuest: false },
        auth: {
          credentials: { login: null },
        },
      });

      expectState(mock, CompleteState);

      state.enter(context);
    });
  });

  describe('#resolve', () => {
    it('should call login with login and password', () => {
      const expectedLogin = 'foo';
      const expectedPassword = 'bar';
      const expectedRememberMe = true;

      context.getState.returns({
        auth: {
          credentials: {
            login: expectedLogin,
          },
        },
      });

      expectRun(
        mock,
        'login',
        sinon.match({
          login: expectedLogin,
          password: expectedPassword,
          rememberMe: expectedRememberMe,
        }),
      ).returns(Promise.resolve());
      expectState(mock, CompleteState);

      const payload = {
        password: expectedPassword,
        rememberMe: expectedRememberMe,
      };

      return expect(state.resolve(context, payload), 'to be fulfilled');
    });

    it('should go to MfaState if totp required', () => {
      const expectedLogin = 'foo';
      const expectedPassword = 'bar';
      const expectedRememberMe = true;

      context.getState.returns({
        auth: {
          credentials: {
            login: expectedLogin,
            isTotpRequired: true,
          },
        },
      });

      expectRun(
        mock,
        'login',
        sinon.match({
          login: expectedLogin,
          password: expectedPassword,
          rememberMe: expectedRememberMe,
        }),
      ).returns(Promise.resolve());
      expectState(mock, MfaState);

      const payload = {
        password: expectedPassword,
        rememberMe: expectedRememberMe,
      };

      return expect(state.resolve(context, payload), 'to be fulfilled');
    });

    it('should navigate to returnUrl if any', () => {
      const expectedLogin = 'foo';
      const expectedPassword = 'bar';
      const expectedReturnUrl = '/returnUrl';
      const expectedRememberMe = true;

      context.getState.returns({
        auth: {
          credentials: {
            login: expectedLogin,
            returnUrl: expectedReturnUrl,
          },
        },
      });

      expectRun(
        mock,
        'login',
        sinon.match({
          login: expectedLogin,
          password: expectedPassword,
          rememberMe: expectedRememberMe,
        }),
      ).returns(Promise.resolve());
      expectNavigate(mock, expectedReturnUrl);

      const payload = {
        password: expectedPassword,
        rememberMe: expectedRememberMe,
      };

      return expect(state.resolve(context, payload), 'to be fulfilled');
    });
  });

  describe('#reject', () => {
    it('should transition to forgot password state', () => {
      expectState(mock, ForgotPasswordState);

      state.reject(context);
    });
  });

  describe('#goBack', () => {
    it('should transition to login state', () => {
      context.getState.returns({
        auth: {
          credentials: {
            login: 'foo',
          },
        },
      });

      expectRun(mock, 'setLogin', null);
      expectState(mock, LoginState);

      state.goBack(context);
    });

    it('should transition to ChooseAccountState if this is relogin', () => {
      context.getState.returns({
        accounts: {
          active: 1,
          available: [{ id: 1 }, { id: 2 }],
        },
        auth: {
          credentials: {
            login: 'foo',
            isRelogin: true,
          },
        },
      });

      expectRun(mock, 'activateAccount', { id: 2 });
      expectRun(mock, 'removeAccount', { id: 1 });
      expectState(mock, ChooseAccountState);

      state.goBack(context);
    });

    it('should transition to LoginState if this is relogin and only one account available', () => {
      context.getState.returns({
        accounts: {
          active: 1,
          available: [{ id: 1 }],
        },
        auth: {
          credentials: {
            login: 'foo',
            isRelogin: true,
          },
        },
      });

      expectRun(mock, 'logout');
      expectRun(mock, 'setLogin', null);
      expectState(mock, LoginState);

      state.goBack(context);
    });
  });
});
