/* eslint @typescript-eslint/camelcase: off */
import sinon from 'sinon';

import OAuthState from 'app/services/authFlow/OAuthState';
import CompleteState from 'app/services/authFlow/CompleteState';

import { bootstrap, expectState, expectRun } from './helpers';

describe('OAuthState', () => {
  let state;
  let context;
  let mock;

  beforeEach(() => {
    state = new OAuthState();

    const data = bootstrap();
    context = data.context;
    mock = data.mock;
  });

  afterEach(() => {
    mock.verify();
  });

  describe('#enter', () => {
    it('should run oAuthValidate', () => {
      const query = {
        client_id: 'client_id',
        redirect_uri: 'redirect_uri',
        response_type: 'response_type',
        description: 'description',
        scope: 'scope1 scope2',
        prompt: 'none',
        login_hint: '1',
        state: 'state',
      };

      context.getRequest.returns({
        query: new URLSearchParams(query),
        params: {},
      });

      expectRun(
        mock,
        'oAuthValidate',
        sinon.match({
          clientId: query.client_id,
          redirectUrl: query.redirect_uri,
          responseType: query.response_type,
          description: query.description,
          scope: query.scope,
          prompt: query.prompt,
          loginHint: query.login_hint,
          state: query.state,
        }),
      ).returns({ then() {} });

      state.enter(context);
    });

    it('should support clientId through route params', () => {
      const clientId = 'client_id';
      const query = {
        redirect_uri: 'redirect_uri',
        response_type: 'response_type',
        scope: 'scope1 scope2',
        state: 'state',
      };

      context.getRequest.returns({
        query: new URLSearchParams(query),
        params: { clientId },
      });

      expectRun(
        mock,
        'oAuthValidate',
        sinon.match({
          clientId,
          redirectUrl: query.redirect_uri,
          responseType: query.response_type,
          scope: query.scope,
          state: query.state,
        }),
      ).returns({ then() {} });

      state.enter(context);
    });

    it('should give preference to client_id from query', () => {
      const clientId = 'wrong_id';
      const query = {
        client_id: 'client_id',
        redirect_uri: 'redirect_uri',
        response_type: 'response_type',
        scope: 'scope1 scope2',
        state: 'state',
      };

      context.getRequest.returns({
        query: new URLSearchParams(query),
        params: { clientId },
      });

      expectRun(
        mock,
        'oAuthValidate',
        sinon.match({
          clientId: query.client_id,
          redirectUrl: query.redirect_uri,
          responseType: query.response_type,
          scope: query.scope,
          state: query.state,
        }),
      ).returns({ then() {} });

      state.enter(context);
    });

    it('should replace commas with spaces in scope param', () => {
      const query = {
        client_id: 'client_id',
        redirect_uri: 'redirect_uri',
        response_type: 'response_type',
        scope: 'scope1,scope2,scope3',
        state: 'state',
      };

      context.getRequest.returns({
        query: new URLSearchParams(query),
      });

      expectRun(
        mock,
        'oAuthValidate',
        sinon.match({
          clientId: query.client_id,
          redirectUrl: query.redirect_uri,
          responseType: query.response_type,
          scope: 'scope1 scope2 scope3',
          state: query.state,
        }),
      ).returns({ then() {} });

      state.enter(context);
    });

    it('should transition to complete state on success', () => {
      const promise = Promise.resolve();

      context.getRequest.returns({ query: new URLSearchParams(), params: {} });

      mock.expects('run').returns(promise);
      expectState(mock, CompleteState);

      state.enter(context);

      return promise;
    });
  });
});
