import { routeActions } from 'react-router-redux';

import * as actions from 'components/auth/actions';
import {updateUser} from 'components/user/actions';

import RegisterState from './RegisterState';
import LoginState from './LoginState';
import OAuthState from './OAuthState';
import ForgotPasswordState from './ForgotPasswordState';

const availableActions = {
    ...actions,
    updateUser
};

export default class AuthFlow {
    constructor(states) {
        this.states = states;
    }

    setStore(store) {
        this.navigate = (route) => {
            const {routing} = this.getState();

            if (routing.location.pathname !== route) {
                if (this.replace) {
                    this.replace(route);
                }
                store.dispatch(routeActions.push(route));
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
        if (!availableActions[actionId]) {
            throw new Error(`Action ${actionId} does not exists`);
        }

        return this.dispatch(availableActions[actionId](payload));
    }

    setState(state) {
        if (!state) {
            throw new Error('State is required');
        }

        // if (this.state instanceof state.constructor) {
        //     // already in this state
        //     return;
        // }

        this.state && this.state.leave(this);
        this.state = state;
        this.state.enter(this);
    }

    handleRequest(path, replace) {
        this.replace = replace;

        switch (path) {
            case '/oauth':
                this.setState(new OAuthState());
                break;

            case '/register':
                this.setState(new RegisterState());
                break;

            case '/forgot-password':
                this.setState(new ForgotPasswordState());
                break;

            case '/':
            case '/login':
            case '/password':
            case '/activation':
            case '/password-change':
            case '/oauth/permissions':
            case '/oauth/finish':
                this.setState(new LoginState());
                break;

            case '/logout':
                this.run('logout');
                this.setState(new LoginState());
                break;

            default:
                throw new Error(`Unsupported request: ${path}`);
        }
    }

    login() {
        this.setState(new LoginState());
    }
}
