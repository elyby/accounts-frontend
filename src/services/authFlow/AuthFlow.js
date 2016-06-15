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
            const {routing} = this.getState();

            if (routing.location.pathname !== route) {
                this.currentPath = route;

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
     * This should be called from onEnter prop of react-router Route component
     *
     * @param {string} path
     * @param {function} replace
     * @param {function} [callback = function() {}] - an optional callback function to be called, when state will be stabilized
     *                                                (state's enter function's promise resolved)
     */
    handleRequest(path, replace, callback = function() {}) {
        this.replace = replace;
        this.onReady = callback;

        if (this.currentPath === path) {
            // we are already handling this path
            this.onReady();
            return;
        }

        this.currentPath = path;

        if (path === '/') {
            // reset oauth data if user tried to navigate to index route
            this.run('setOAuthRequest', {});
        }

        switch (path) { // use only first part of an url
            case '/oauth':
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
            case '/change-password':
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
                        throw new Error(`Unsupported request: ${path}`);
                }
        }

        this.onReady();
    }
}
