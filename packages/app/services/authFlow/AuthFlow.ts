import { browserHistory } from 'app/services/history';
import logger from 'app/services/logger';
import localStorage from 'app/services/localStorage';
import { Store, State as RootState, Dispatch } from 'app/types';
import {
    activate as activateAccount,
    authenticate,
    logoutAll as logout,
    remove as removeAccount,
} from 'app/components/accounts/actions';
import * as actions from 'app/components/auth/actions';
import { updateUser } from 'app/components/user/actions';
import dispatchBsod from 'app/components/ui/bsod/dispatchBsod';

import FinishState from './FinishState';
import RegisterState from './RegisterState';
import LoginState from './LoginState';
import InitOAuthAuthCodeFlowState from './InitOAuthAuthCodeFlowState';
import InitOAuthDeviceCodeFlowState from './InitOAuthDeviceCodeFlowState';
import ForgotPasswordState from './ForgotPasswordState';
import RecoverPasswordState from './RecoverPasswordState';
import ActivationState from './ActivationState';
import CompleteState from './CompleteState';
import ChooseAccountState from './ChooseAccountState';
import ResendActivationState from './ResendActivationState';
import State from './State';

interface Request {
    path: string;
    query: URLSearchParams;
    params: Record<string, any>;
}

export const availableActions = {
    updateUser,
    authenticate,
    activateAccount,
    removeAccount,
    logout,
    goBack: actions.goBack,
    redirect: actions.redirect,
    login: actions.login,
    acceptRules: actions.acceptRules,
    forgotPassword: actions.forgotPassword,
    recoverPassword: actions.recoverPassword,
    register: actions.register,
    activate: actions.activate,
    resendActivation: actions.resendActivation,
    contactUs: actions.contactUs,
    setLogin: actions.setLogin,
    setAccountSwitcher: actions.setAccountSwitcher,
    setErrors: actions.setErrors,
    clearErrors: actions.clearErrors,
    oAuthValidate: actions.oAuthValidate,
    oAuthComplete: actions.oAuthComplete,
    setClient: actions.setClient,
    resetOAuth: actions.resetOAuth,
    resetAuth: actions.resetAuth,
    setOAuthRequest: actions.setOAuthRequest,
    setOAuthCode: actions.setOAuthCode,
    requirePermissionsAccept: actions.requirePermissionsAccept,
    setScopes: actions.setScopes,
    setLoadingState: actions.setLoadingState,
};

type ActionId = keyof typeof availableActions;

export interface AuthContext {
    run<T extends ActionId>(actionId: T, payload?: Parameters<typeof availableActions[T]>[0]): Promise<any>; // TODO: can't find a way to explain to TS the returned type
    setState(newState: State): Promise<void> | void; // TODO: always return promise
    getState(): RootState;
    navigate(route: string, options?: { replace?: boolean }): void;
    getRequest(): Request;
    prevState: State;
}

export default class AuthFlow implements AuthContext {
    actions: Readonly<typeof availableActions>;
    state: State;
    prevState: State;
    /**
     * A callback from router, that allows to replace (perform redirect) route
     * during route transition
     */
    replace: ((path: string) => void) | null;
    onReady: () => void;
    navigate: (route: string, options: { replace?: boolean }) => void;
    currentRequest: Partial<Request> = {};
    oAuthStateRestored = false;
    dispatch: Dispatch;
    getState: () => RootState;

    constructor(actions: typeof availableActions) {
        this.actions = Object.freeze(actions);
    }

    setStore(store: Store): void {
        this.navigate = (route: string, options: { replace?: boolean } = {}): void => {
            const { path: currentPath } = this.getRequest();

            if (currentPath !== route) {
                if (currentPath.startsWith('/oauth2/v1') && options.replace === undefined) {
                    options.replace = true;
                }

                if (this.replace) {
                    this.replace(route);
                }

                if (options.replace) {
                    browserHistory.replace(route);
                } else {
                    browserHistory.push(route);
                }
            }

            this.replace = null;
        };

        this.getState = store.getState.bind(store);
        this.dispatch = store.dispatch.bind(store);
    }

    resolve(payload: Record<string, any> = {}) {
        const maybePromise = this.state.resolve(this, payload);

        if (maybePromise && maybePromise.catch) {
            maybePromise.catch((err) => {
                dispatchBsod();
                throw err;
            });
        }
    }

    reject(payload: Record<string, any> = {}) {
        try {
            this.state.reject(this, payload);
        } catch (err) {
            dispatchBsod();
            throw err;
        }
    }

    goBack() {
        this.state.goBack(this);
    }

    run<T extends ActionId>(actionId: T, payload?: Parameters<typeof availableActions[T]>[0]): Promise<any> {
        // @ts-expect-error the extended version of redux with thunk will return the correct promise
        return Promise.resolve(this.dispatch(this.actions[actionId](payload)));
    }

    setState(state: State): Promise<void> | void {
        this.state?.leave(this);
        this.prevState = this.state;
        this.state = state;
        const resp = this.state.enter(this);

        if (resp && resp.then) {
            // this is a state with an async enter phase
            // block route components from mounting, till promise will be resolved
            if (this.onReady) {
                const callback = this.onReady;
                this.onReady = () => {};

                return resp.then(callback, (error) => {
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
     */
    handleRequest(request: Request, replace: (path: string) => void, callback: () => void = () => {}): void {
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

            case '/code':
                this.setState(new InitOAuthDeviceCodeFlowState());
                break;

            case '/oauth/finish':
                this.setState(new FinishState());
                break;

            case '/':
            case '/login':
            case '/password':
            case '/mfa':
            case '/accept-rules':
            case '/oauth/permissions':
            case '/oauth/choose-account':
                this.setState(new LoginState());
                break;

            default:
                switch (
                    path.replace(/(.)\/.+/, '$1') // use only first part of an url
                ) {
                    case '/oauth2':
                        this.setState(new InitOAuthAuthCodeFlowState());
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const data = JSON.parse(localStorage.getItem('oauthData')!);
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
