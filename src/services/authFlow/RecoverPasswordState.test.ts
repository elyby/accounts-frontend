import sinon from 'sinon';

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

      context.getRequest.returns({ path: expectedPath });

      expectNavigate(mock, expectedPath);

      state.enter(context);
    });

    it('should navigate to /recover-password/key', () => {
      const expectedPath = '/recover-password/sasx5AS4d61';

      context.getRequest.returns({ path: expectedPath });

      expectNavigate(mock, expectedPath);

      state.enter(context);
    });
  });

  describe('#resolve', () => {
    it('should call recoverPassword with provided payload', () => {
      const expectedPayload = {
        key: 123,
        newPassword: '123',
        newRePassword: '123',
      };

      expectRun(mock, 'recoverPassword', sinon.match(expectedPayload)).returns(
        new Promise(() => {}),
      );

      state.resolve(context, expectedPayload);
    });

    it('should transition to complete state on success', () => {
      const promise = Promise.resolve();

      mock.expects('run').returns(promise);
      expectState(mock, CompleteState);

      state.resolve(context, {});

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
    it('should run contactUs popup', () => {
      expectRun(mock, 'contactUs');

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
