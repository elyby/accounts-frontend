import { routeActions } from 'react-router-redux';

import RegisterState from './RegisterState';
import LoginState from './LoginState';
import OAuthState from './OAuthState';
import ForgotPasswordState from './ForgotPasswordState';
import RecoverPasswordState from './RecoverPasswordState';
import ActivationState from './ActivationState';
import ResendActivationState from './ResendActivationState';

// TODO: a way to unload service (when we are on account page)

export default class AuthFlow {
    constructor(actions) {
        if (typeof actions !== 'object') {
            throw new Error('AuthFlow requires an actions object');
        }

        this.actions = actions;

        if (Object.freeze) {
            Object.freeze(this.actions);
        }
    }

    setStore(store) {
        this.navigate = (route) => {
            if (this.getRequest().path !== route) {
                this.currentRequest = {
                    path: route
                };

                if (this.replace) {
                    this.replace(route);
                }
                store.dispatch(routeActions.push(route)); // TODO: may be deleted?
            }

            this.replace = null;
        };

        this.getState = store.getState.bind(store);
        this.dispatch = store.dispatch.bind(store);
    }

    resolve(payload = {}) {
        this.state.resolve(this, payload);
    }

    reject(payload = {}) {
        this.state.reject(this, payload);
    }

    goBack() {
        this.state.goBack(this);
    }

    run(actionId, payload) {
        if (actionId === 'redirect') {
            location.href = payload;
            return;
        }

        if (!this.actions[actionId]) {
            throw new Error(`Action ${actionId} does not exists`);
        }

        return this.dispatch(this.actions[actionId](payload));
    }

    setState(state) {
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
                return resp.then(callback);
            }

            return resp;
        }
    }

    /**
     * @return {object} - current request object
     */
    getRequest() {
        return this.currentRequest ? {...this.currentRequest} : {};
    }

    /**
     * This should be called from onEnter prop of react-router Route component
     *
     * @param {object} request
     * @param {string} request.path
     * @param {object} request.params
     * @param {object} request.query
     * @param {function} replace
     * @param {function} [callback = function() {}] - an optional callback function to be called, when state will be stabilized
     *                                                (state's enter function's promise resolved)
     */
    handleRequest(request, replace, callback = function() {}) {
        const {path, params = {}, query = {}} = request;
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

        if (path === '/') {
            // reset oauth data if user tried to navigate to index route
            this.run('setOAuthRequest', {});
        }

        switch (path) {
            case '/oauth2/v1':
            case '/oauth2':
                this.setState(new OAuthState());
                break;

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
            case '/accept-rules':
            case '/oauth/permissions':
            case '/oauth/finish':
                this.setState(new LoginState());
                break;

            default:
                switch (path.replace(/(.)\/.+/, '$1')) { // use only first part of an url
                    case '/activation':
                        this.setState(new ActivationState());
                        break;
                    case '/recover-password':
                        this.setState(new RecoverPasswordState());
                        break;

                    default:
                        console.log('Unsupported request', {path, query, params});
                        replace('/404');
                        break;
                }
        }

        this.onReady();
    }
}
