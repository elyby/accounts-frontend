// @flow
import { browserHistory } from 'services/history';

import logger from 'services/logger';
import localStorage from 'services/localStorage';

import RegisterState from './RegisterState';
import LoginState from './LoginState';
import OAuthState from './OAuthState';
import ForgotPasswordState from './ForgotPasswordState';
import RecoverPasswordState from './RecoverPasswordState';
import ActivationState from './ActivationState';
import CompleteState from './CompleteState';
import ResendActivationState from './ResendActivationState';
import type AbstractState from './AbstractState';

type Request = {
    path: string,
    query: URLSearchParams,
    params: Object
};

// TODO: temporary added to improve typing without major refactoring
type ActionId =
    | 'updateUser'
    | 'authenticate'
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
    run(actionId: ActionId, payload?: mixed): *;
    setState(newState: AbstractState): Promise<*> | void;
    getState(): Object;
    navigate(route: string): void;
    getRequest(): Request;
}

export default class AuthFlow implements AuthContext {
    actions: {[key: string]: (mixed) => Object};
    state: AbstractState;
    prevState: AbstractState;
    /**
     * A callback from router, that allows to replace (perform redirect) route
     * during route transition
     */
    replace: ?(string) => void;
    onReady: Function;
    navigate: Function;
    currentRequest: Request;
    dispatch: (action: Object) => void;
    getState: () => Object;

    constructor(actions: {[key: string]: Function}) {
        if (typeof actions !== 'object') {
            throw new Error('AuthFlow requires an actions object');
        }

        this.actions = actions;

        if (Object.freeze) {
            Object.freeze(this.actions);
        }
    }

    setStore(store: *) {
        /**
         * @param {string} route
         * @param {object} options
         * @param {object} options.replace
         */
        this.navigate = (route: string, options: {replace?: bool} = {}) => {
            if (this.getRequest().path !== route) {
                this.currentRequest = {
                    path: route,
                    params: {},
                    query: new URLSearchParams()
                };

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

    resolve(payload: Object = {}) {
        this.state.resolve(this, payload);
    }

    reject(payload: Object = {}) {
        this.state.reject(this, payload);
    }

    goBack() {
        this.state.goBack(this);
    }

    run(actionId: ActionId, payload?: mixed): Promise<any> {
        const action = this.actions[actionId];

        if (!action) {
            throw new Error(`Action ${actionId} does not exists`);
        }

        return Promise.resolve(
            this.dispatch(
                action(payload)
            )
        );
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
                return resp.then(callback, (err) => err || logger.warn('State transition error', err));
            }

            return resp;
        }
    }

    /**
     * @return {object} - current request object
     */
    getRequest() {
        return {
            path: '',
            query: new URLSearchParams(),
            params: {},
            ...this.currentRequest
        };
    }

    /**
     * This should be called from onEnter prop of react-router Route component
     *
     * @param {object} request
     * @param {string} request.path
     * @param {object} request.params
     * @param {URLSearchParams} request.query
     * @param {function} replace
     * @param {function} [callback = function() {}] - an optional callback function to be called, when state will be stabilized
     *                                                (state's enter function's promise resolved)
     */
    handleRequest(request: Request, replace: Function, callback: Function = function() {}) {
        const {path} = request;
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
                switch (path.replace(/(.)\/.+/, '$1')) { // use only first part of an url
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
     * @api private
     *
     * @return {bool} - whether oauth state is being restored
     */
    restoreOAuthState() {
        if (/^\/(register|oauth2)/.test(this.getRequest().path)) {
            // allow register or the new oauth requests
            return;
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
        } catch (err) {/* bad luck :( */}

        return false;
    }
}
