import sinon, { SinonMock } from 'sinon';

import LoginState from 'app/services/authFlow/LoginState';
import PasswordState from 'app/services/authFlow/PasswordState';
import RegisterState from 'app/services/authFlow/RegisterState';

import {
  bootstrap,
  expectState,
  expectNavigate,
  expectRun,
  MockedAuthContext,
} from './helpers';

describe('LoginState', () => {
  let state: LoginState;
  let context: MockedAuthContext;
  let mock: SinonMock;

  beforeEach(() => {
    state = new LoginState();

    const data = bootstrap();
    context = data.context;
    mock = data.mock;
  });

  afterEach(() => {
    mock.verify();
  });

  describe('#enter', () => {
    it('should navigate to /login', () => {
      context.getState.returns({
        user: { isGuest: true },
        auth: {
          credentials: { login: null },
        },
      });

      expectNavigate(mock, '/login');

      state.enter(context);
    });

    it('should transition to password if login was set', () => {
      context.getState.returns({
        user: { isGuest: true },
        auth: {
          credentials: { login: 'foo' },
        },
      });

      expectState(mock, PasswordState);

      state.enter(context);
    });
  });

  describe('#resolve', () => {
    it('should call login with email or username', () => {
      const payload = { login: 'login' };

      expectRun(mock, 'login', sinon.match.same(payload)).returns(
        new Promise(() => {}),
      );

      state.resolve(context, payload);
    });

    it('should transition to password state on successfull login (first phase)', () => {
      const promise = Promise.resolve();

      mock.expects('run').returns(promise);
      expectState(mock, PasswordState);

      state.resolve(context, { login: 'login' });

      return promise;
    });

    it('should NOT transition to password state on fail', () => {
      const promise = Promise.reject();

      mock.expects('run').returns(promise);
      mock.expects('setState').never();

      state.resolve(context, { login: 'login' });

      return promise.catch(mock.verify.bind(mock));
    });
  });

  describe('#reject', () => {
    it('should transition to register state', () => {
      expectState(mock, RegisterState);

      state.reject(context);
    });
  });

  describe('#goBack', () => {
    it('should return to previous page', () => {
      expectRun(mock, 'goBack', {
        fallbackUrl: '/',
      });

      state.goBack(context);
    });
  });
});
