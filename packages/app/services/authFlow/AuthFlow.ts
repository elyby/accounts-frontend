import { browserHistory } from 'app/services/history';
import logger from 'app/services/logger';
import localStorage from 'app/services/localStorage';
import { RootState } from 'app/reducers';

import RegisterState from './RegisterState';
import LoginState from './LoginState';
import OAuthState from './OAuthState';
import ForgotPasswordState from './ForgotPasswordState';
import RecoverPasswordState from './RecoverPasswordState';
import ActivationState from './ActivationState';
import CompleteState from './CompleteState';
import ChooseAccountState from './ChooseAccountState';
import ResendActivationState from './ResendActivationState';
import AbstractState from './AbstractState';

type Request = {
  path: string;
  query: URLSearchParams;
  params: { [key: string]: any };
};

// TODO: temporary added to improve typing without major refactoring
type ActionId =
  | 'updateUser'
  | 'authenticate'
  | 'activateAccount'
  | 'removeAccount'
  | 'logout'
  | 'goBack'
  | 'redirect'
  | 'login'
  | 'acceptRules'
  | 'forgotPassword'
  | 'recoverPassword'
  | 'register'
  | 'activate'
  | 'resendActivation'
  | 'contactUs'
  | 'setLogin'
  | 'setAccountSwitcher'
  | 'setErrors'
  | 'clearErrors'
  | 'oAuthValidate'
  | 'oAuthComplete'
  | 'setClient'
  | 'resetOAuth'
  | 'resetAuth'
  | 'setOAuthRequest'
  | 'setOAuthCode'
  | 'requirePermissionsAccept'
  | 'setScopes'
  | 'setLoadingState';

export interface AuthContext {
  run(actionId: ActionId, payload?: any): Promise<any>;
  setState(newState: AbstractState): Promise<void> | void;
  getState(): RootState;
  navigate(route: string, options?: { replace?: boolean }): void;
  getRequest(): Request;
  prevState: AbstractState;
}

export type ActionsDict = {
  [key: string]: (action: any) => { [key: string]: any };
};

export default class AuthFlow implements AuthContext {
  actions: ActionsDict;
  state: AbstractState;
  prevState: AbstractState;
  /**
   * A callback from router, that allows to replace (perform redirect) route
   * during route transition
   */
  replace: ((path: string) => void) | null;
  onReady: () => void;
  navigate: (route: string, options: { replace?: boolean }) => void;
  currentRequest: Request;
  oAuthStateRestored = false;
  dispatch: (action: { [key: string]: any }) => void;
  getState: () => RootState;

  constructor(actions: ActionsDict) {
    if (typeof actions !== 'object') {
      throw new Error('AuthFlow requires an actions object');
    }

    this.actions = actions;

    if (Object.freeze) {
      Object.freeze(this.actions);
    }
  }

  setStore(store: {
    getState: () => { [key: string]: any };
    dispatch: (
      action: { [key: string]: any } | ((...args: any[]) => any),
    ) => void;
  }) {
    /**
     * @param {string} route
     * @param {object} options
     * @param {object} options.replace
     */
    this.navigate = (route: string, options: { replace?: boolean } = {}) => {
      const { path: currentPath } = this.getRequest();

      if (currentPath !== route) {
        if (
          currentPath.startsWith('/oauth2/v1') &&
          options.replace === undefined
        ) {
          options.replace = true;
        }

        if (this.replace) {
          this.replace(route);
        }

        browserHistory[options.replace ? 'replace' : 'push'](route);
      }

      this.replace = null;
    };

    this.getState = store.getState.bind(store);
    this.dispatch = store.dispatch.bind(store);
  }

  resolve(payload: { [key: string]: any } = {}) {
    this.state.resolve(this, payload);
  }

  reject(payload: { [key: string]: any } = {}) {
    this.state.reject(this, payload);
  }

  goBack() {
    this.state.goBack(this);
  }

  run(actionId: ActionId, payload?: { [key: string]: any }): Promise<any> {
    const action = this.actions[actionId];

    if (!action) {
      throw new Error(`Action ${actionId} does not exists`);
    }

    return Promise.resolve(this.dispatch(action(payload)));
  }

  setState(state: AbstractState) {
    if (!state) {
      throw new Error('State is required');
    }

    this.state && this.state.leave(this);
    this.prevState = this.state;
    this.state = state;
    const resp = this.state.enter(this);

    if (resp && resp.then) {
      // this is a state with an async enter phase
      // block route components from mounting, till promise will be resolved
      if (this.onReady) {
        const callback = this.onReady;
        this.onReady = () => {};

        return resp.then(callback, error => {
          logger.error('State transition error', { error });

          return error;
        });
      }

      return resp;
    }
  }

  getRequest() {
    return {
      path: '',
      query: new URLSearchParams(),
      params: {},
      ...this.currentRequest,
    };
  }

  /**
   * This should be called from onEnter prop of react-router Route component
   *
   * @param {object} request
   * @param {string} request.path
   * @param {object} request.params
   * @param {URLSearchParams} request.query
   * @param {Function} replace
   * @param {Function} [callback=function() {}] - an optional callback function to be called, when state will be stabilized
   * (state's enter function's promise resolved)
   */
  handleRequest(
    request: Request,
    replace: (path: string) => void,
    callback: () => void = () => {},
  ) {
    const { path } = request;
    this.replace = replace;
    this.onReady = callback;

    if (!path) {
      throw new Error('The request.path is required');
    }

    if (this.getRequest().path === path) {
      // we are already handling this path
      this.onReady();

      return;
    }

    this.currentRequest = request;

    if (this.restoreOAuthState()) {
      return;
    }

    switch (path) {
      case '/register':
        this.setState(new RegisterState());
        break;

      case '/forgot-password':
        this.setState(new ForgotPasswordState());
        break;

      case '/resend-activation':
        this.setState(new ResendActivationState());
        break;

      case '/choose-account':
        this.setState(new ChooseAccountState());
        break;

      case '/':
      case '/login':
      case '/password':
      case '/mfa':
      case '/accept-rules':
      case '/oauth/permissions':
      case '/oauth/finish':
      case '/oauth/choose-account':
        this.setState(new LoginState());
        break;

      default:
        switch (
          path.replace(/(.)\/.+/, '$1') // use only first part of an url
        ) {
          case '/oauth2':
            this.setState(new OAuthState());
            break;
          case '/activation':
            this.setState(new ActivationState());
            break;
          case '/recover-password':
            this.setState(new RecoverPasswordState());
            break;

          default:
            replace('/404');
            break;
        }
    }

    this.onReady();
  }

  /**
   * Tries to restore last oauth request, if it was stored in localStorage
   * in last 2 hours
   *
   * @returns {bool} - whether oauth state is being restored
   */
  private restoreOAuthState(): boolean {
    if (this.oAuthStateRestored) {
      return false;
    }

    this.oAuthStateRestored = true;

    if (/^\/(register|oauth2)/.test(this.getRequest().path)) {
      // allow register or the new oauth requests
      return false;
    }

    try {
      const data = JSON.parse(localStorage.getItem('oauthData'));
      const expirationTime = 2 * 60 * 60 * 1000; // 2h

      if (Date.now() - data.timestamp < expirationTime) {
        this.run('oAuthValidate', data.payload)
          .then(() => this.setState(new CompleteState()))
          .then(() => this.onReady());

        return true;
      }
    } catch (err) {
      /* bad luck :( */
    }

    return false;
  }
}
