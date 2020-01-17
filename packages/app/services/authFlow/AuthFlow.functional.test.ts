import expect from 'app/test/unexpected';
import sinon from 'sinon';

import { Store } from 'redux';

import AuthFlow from 'app/services/authFlow/AuthFlow';

import RegisterState from 'app/services/authFlow/RegisterState';
import ActivationState from 'app/services/authFlow/ActivationState';
import ResendActivationState from 'app/services/authFlow/ResendActivationState';

describe('AuthFlow.functional', () => {
  let flow: AuthFlow;
  let actions: {};
  let store: Store;
  let state: { user?: { isGuest: boolean; isActive: boolean } };
  let navigate: (path: string, extra?: {}) => void;

  beforeEach(() => {
    actions = {};
    store = {
      getState: sinon.stub().named('store.getState'),
      // @ts-ignore
      dispatch: sinon
        .spy(({ type, payload = {} }) => {
          if (type === '@@router/TRANSITION' && payload.method === 'push') {
            // emulate redux-router
            // @ts-ignore
            navigate(...payload.args);
          }
        })
        .named('store.dispatch'),
    };

    state = {};

    // @ts-ignore
    flow = new AuthFlow(actions);
    flow.setStore(store);

    let lastUrl: string;

    navigate = function navigate(path, extra = {}) {
      // emulates router behaviour
      if (lastUrl !== path) {
        lastUrl = path;
        flow.handleRequest(
          { path, query: new URLSearchParams(), params: {}, ...extra },
          navigate,
        );
      }
    };

    sinon.stub(flow, 'run').named('flow.run');
    sinon.spy(flow, 'navigate').named('flow.navigate');
    // @ts-ignore
    store.getState.returns(state);
  });

  describe('guest', () => {
    beforeEach(() => {
      Object.assign(state, {
        user: {
          isGuest: true,
        },
        auth: {
          credentials: {
            login: null,
          },
        },
      });
    });

    it('should redirect guest / -> /login', () => {
      navigate('/');

      expect(flow.navigate, 'was called twice');
      expect(flow.navigate, 'to have a call satisfying', ['/login']);
    });

    it('should redirect guest to /login after /login -> /', () => {
      // this is to ensure, that when AuthFlow is already on LoginState (on /login)
      // it will not allow user to go to / (which is forbidden for users) and will
      // always redirect to /login, so that enter condition of state is always satisfied

      navigate('/login');
      navigate('/');

      expect(flow.navigate, 'was called thrice');
      expect(flow.navigate, 'to have calls satisfying', [
        ['/login'],
        ['/login'],
        ['/login'],
      ]);
    });
  });

  describe('oauth', () => {
    it('should oauth without any rendering if no acceptance required', () => {
      const expectedRedirect = 'foo';

      Object.assign(state, {
        user: {
          isGuest: false,
          isActive: true,
        },

        auth: {
          oauth: {
            clientId: 123,
            prompt: [],
          },
        },
      });

      // @ts-ignore
      flow.run.onCall(0).returns({ then: fn => fn() });
      // @ts-ignore
      flow.run.onCall(1).returns({
        then: (fn: Function) =>
          fn({
            redirectUri: expectedRedirect,
          }),
      });

      navigate('/oauth2');

      expect(flow.run, 'to have calls satisfying', [
        ['oAuthValidate', {}],
        ['oAuthComplete', {}],
        ['redirect', expectedRedirect],
      ]);
    });
  });

  describe('/resend-activation #goBack()', () => {
    beforeEach(() => {
      state.user = {
        isGuest: true,
        isActive: false,
      };
    });

    it('should goBack to /activation', () => {
      navigate('/activation');
      expect(flow.state, 'to be a', ActivationState);

      flow.state.reject(flow);
      expect(flow.state, 'to be a', ResendActivationState);

      flow.state.goBack(flow);
      expect(flow.state, 'to be a', ActivationState);
    });

    it('should goBack to /register', () => {
      navigate('/register');
      expect(flow.state, 'to be a', RegisterState);

      flow.state.reject(flow, { requestEmail: true });
      expect(flow.state, 'to be a', ResendActivationState);

      flow.state.goBack(flow);
      expect(flow.state, 'to be a', RegisterState);
    });
  });
});
