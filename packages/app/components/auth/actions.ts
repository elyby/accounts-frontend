import { Action as ReduxAction } from 'redux';
import { browserHistory } from 'app/services/history';
import logger from 'app/services/logger';
import localStorage from 'app/services/localStorage';
import * as loader from 'app/services/loader';
import history from 'app/services/history';
import { updateUser, acceptRules as userAcceptRules } from 'app/components/user/actions';
import { authenticate, logoutAll } from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import {
    login as loginEndpoint,
    forgotPassword as forgotPasswordEndpoint,
    recoverPassword as recoverPasswordEndpoint,
    OAuthResponse,
} from 'app/services/api/authentication';
import oauth, { OauthData, Scope } from 'app/services/api/oauth';
import {
    register as registerEndpoint,
    activate as activateEndpoint,
    resendActivation as resendActivationEndpoint,
} from 'app/services/api/signup';
import dispatchBsod from 'app/components/ui/bsod/dispatchBsod';
import { create as createPopup } from 'app/components/ui/popup/actions';
import ContactForm from 'app/components/contact';
import { Account } from 'app/components/accounts/reducer';
import { Action as AppAction, Dispatch } from 'app/types';
import { Resp } from 'app/services/request';

import { Credentials, Client, OAuthState, getCredentials } from './reducer';

interface ValidationErrorLiteral {
    type: string;
    payload: Record<string, any>;
}

type ValidationError = string | ValidationErrorLiteral;

/**
 * Routes user to the previous page if it is possible
 *
 * @param {object} options
 * @param {string} options.fallbackUrl - an url to route user to if goBack is not possible
 *
 * @returns {object} - action definition
 */
export function goBack(options: { fallbackUrl?: string }) {
    const { fallbackUrl } = options || {};

    if (history.canGoBack()) {
        browserHistory.goBack();
    } else if (fallbackUrl) {
        browserHistory.push(fallbackUrl);
    }

    return {
        type: 'noop',
    };
}

export function redirect(url: string): () => Promise<void> {
    loader.show();

    return () =>
        new Promise(() => {
            // do not resolve promise to make loader visible and
            // overcome app rendering
            location.href = url;
        });
}

const PASSWORD_REQUIRED = 'error.password_required';
const LOGIN_REQUIRED = 'error.login_required';
const ACTIVATION_REQUIRED = 'error.account_not_activated';
const TOTP_REQUIRED = 'error.totp_required';

export function login({
    login = '',
    password = '',
    totp,
    rememberMe = false,
}: {
    login: string;
    password?: string;
    totp?: string;
    rememberMe?: boolean;
}) {
    return wrapInLoader((dispatch) =>
        loginEndpoint({ login, password, totp, rememberMe })
            .then(authHandler(dispatch))
            .catch((resp) => {
                if (resp.errors) {
                    if (resp.errors.password === PASSWORD_REQUIRED) {
                        return dispatch(setLogin(login));
                    } else if (resp.errors.login === ACTIVATION_REQUIRED) {
                        return dispatch(needActivation());
                    } else if (resp.errors.totp === TOTP_REQUIRED) {
                        return dispatch(
                            requestTotp({
                                login,
                                password,
                                rememberMe,
                            }),
                        );
                    } else if (resp.errors.login === LOGIN_REQUIRED && password) {
                        logger.warn('No login on password panel');

                        return dispatch(logoutAll());
                    }
                }

                return Promise.reject(resp);
            })
            .catch(validationErrorsHandler(dispatch)),
    );
}

export function acceptRules() {
    return wrapInLoader((dispatch) => dispatch(userAcceptRules()).catch(validationErrorsHandler(dispatch)));
}

export function forgotPassword({ login = '', captcha = '' }: { login: string; captcha: string }) {
    return wrapInLoader((dispatch, getState) =>
        forgotPasswordEndpoint(login, captcha)
            .then(({ data = {} }) =>
                dispatch(
                    updateUser({
                        maskedEmail: data.emailMask || getState().user.email,
                    }),
                ),
            )
            .catch(validationErrorsHandler(dispatch)),
    );
}

export function recoverPassword({
    key = '',
    newPassword = '',
    newRePassword = '',
}: {
    key: string;
    newPassword: string;
    newRePassword: string;
}) {
    return wrapInLoader((dispatch) =>
        recoverPasswordEndpoint(key, newPassword, newRePassword)
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/forgot-password')),
    );
}

export function register({
    email = '',
    username = '',
    password = '',
    rePassword = '',
    captcha = '',
    rulesAgreement = false,
}: {
    email: string;
    username: string;
    password: string;
    rePassword: string;
    captcha: string;
    rulesAgreement: boolean;
}) {
    return wrapInLoader((dispatch, getState) =>
        registerEndpoint({
            email,
            username,
            password,
            rePassword,
            rulesAgreement,
            lang: getState().user.lang,
            captcha,
        })
            .then(() => {
                dispatch(
                    updateUser({
                        username,
                        email,
                    }),
                );

                dispatch(needActivation());

                browserHistory.push('/activation');
            })
            .catch(validationErrorsHandler(dispatch)),
    );
}

export function activate({ key = '' }: { key: string }): AppAction<Promise<Account>> {
    return wrapInLoader((dispatch) =>
        activateEndpoint(key)
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/resend-activation')),
    );
}

export function resendActivation({ email = '', captcha }: { email: string; captcha: string }) {
    return wrapInLoader((dispatch) =>
        resendActivationEndpoint(email, captcha)
            .then((resp) => {
                dispatch(
                    updateUser({
                        email,
                    }),
                );

                return resp;
            })
            .catch(validationErrorsHandler(dispatch)),
    );
}

export function contactUs() {
    return createPopup({ Popup: ContactForm });
}

interface SetCredentialsAction extends ReduxAction {
    type: 'auth:setCredentials';
    payload: Credentials | null;
}

function setCredentials(payload: Credentials | null): SetCredentialsAction {
    return {
        type: 'auth:setCredentials',
        payload,
    };
}

/**
 * Sets login in credentials state
 * Resets the state, when `null` is passed
 *
 * @param login
 */
export function setLogin(login: string | null): SetCredentialsAction {
    return setCredentials(login ? { login } : null);
}

export function relogin(login: string | null): AppAction {
    return (dispatch, getState) => {
        const credentials = getCredentials(getState());
        const returnUrl = credentials.returnUrl || location.pathname + location.search;

        dispatch(
            setCredentials({
                login,
                returnUrl,
                isRelogin: true,
            }),
        );

        browserHistory.push('/login');
    };
}

export type CredentialsAction = SetCredentialsAction;

function requestTotp({
    login,
    password,
    rememberMe,
}: {
    login: string;
    password: string;
    rememberMe: boolean;
}): AppAction {
    return (dispatch, getState) => {
        // merging with current credentials to propogate returnUrl
        const credentials = getCredentials(getState());

        dispatch(
            setCredentials({
                ...credentials,
                login,
                password,
                rememberMe,
                isTotpRequired: true,
            }),
        );
    };
}

interface SetSwitcherAction extends ReduxAction {
    type: 'auth:setAccountSwitcher';
    payload: boolean;
}

export function setAccountSwitcher(isOn: boolean): SetSwitcherAction {
    return {
        type: 'auth:setAccountSwitcher',
        payload: isOn,
    };
}

export type AccountSwitcherAction = SetSwitcherAction;

interface SetErrorAction extends ReduxAction {
    type: 'auth:error';
    payload: Record<string, ValidationError> | null;
    error: boolean;
}

export function setErrors(errors: Record<string, ValidationError> | null): SetErrorAction {
    return {
        type: 'auth:error',
        payload: errors,
        error: true,
    };
}

export function clearErrors(): SetErrorAction {
    return setErrors(null);
}

export type ErrorAction = SetErrorAction;

const KNOWN_SCOPES: ReadonlyArray<string> = [
    'minecraft_server_session',
    'offline_access',
    'account_info',
    'account_email',
];
/**
 * @param {object} oauthData
 * @param {string} oauthData.clientId
 * @param {string} oauthData.redirectUrl
 * @param {string} oauthData.responseType
 * @param {string} oauthData.description
 * @param {string} oauthData.scope
 * @param {string} [oauthData.prompt='none'] - comma-separated list of values to adjust auth flow
 *                 Posible values:
 *                  * none - default behaviour
 *                  * consent - forcibly prompt user for rules acceptance
 *                  * select_account - force account choosage, even if user has only one
 * @param {string} oauthData.loginHint - allows to choose the account, which will be used for auth
 *                        The possible values: account id, email, username
 * @param {string} oauthData.state
 *
 * @returns {Promise}
 */
export function oAuthValidate(oauthData: OauthData) {
    // TODO: move to oAuth actions?
    // test request: /oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session&description=foo
    return wrapInLoader((dispatch) =>
        oauth
            .validate(oauthData)
            .then((resp) => {
                const { scopes } = resp.session;
                const invalidScopes = scopes.filter((scope) => !KNOWN_SCOPES.includes(scope));
                let prompt = (oauthData.prompt || 'none').split(',').map((item) => item.trim());

                if (prompt.includes('none')) {
                    prompt = ['none'];
                }

                if (invalidScopes.length) {
                    logger.error('Got invalid scopes after oauth validation', {
                        invalidScopes,
                    });
                }

                dispatch(setClient(resp.client));
                dispatch(
                    setOAuthRequest({
                        ...resp.oAuth,
                        prompt: oauthData.prompt || 'none',
                        loginHint: oauthData.loginHint,
                    }),
                );
                dispatch(setScopes(scopes));
                localStorage.setItem(
                    'oauthData',
                    JSON.stringify({
                        // @see services/authFlow/AuthFlow
                        timestamp: Date.now(),
                        payload: oauthData,
                    }),
                );
            })
            .catch(handleOauthParamsValidation),
    );
}

/**
 * @param {object} params
 * @param {bool} params.accept=false
 * @param params.accept
 * @returns {Promise}
 */
export function oAuthComplete(params: { accept?: boolean } = {}) {
    return wrapInLoader(
        async (
            dispatch,
            getState,
        ): Promise<{
            success: boolean;
            redirectUri: string;
        }> => {
            const oauthData = getState().auth.oauth;

            if (!oauthData) {
                throw new Error('Can not complete oAuth. Oauth data does not exist');
            }

            try {
                const resp = await oauth.complete(oauthData, params);
                localStorage.removeItem('oauthData');

                if (resp.redirectUri.startsWith('static_page')) {
                    const displayCode = /static_page_with_code/.test(resp.redirectUri);

                    const [, code] = resp.redirectUri.match(/code=(.+)&/) || [];
                    [, resp.redirectUri] = resp.redirectUri.match(/^(.+)\?/) || [];

                    dispatch(
                        setOAuthCode({
                            success: resp.success,
                            code,
                            displayCode,
                        }),
                    );
                }

                return resp;
            } catch (error) {
                const resp:
                    | {
                          acceptRequired: boolean;
                      }
                    | {
                          unauthorized: boolean;
                      } = error;

                if ('acceptRequired' in resp) {
                    dispatch(requirePermissionsAccept());

                    return Promise.reject(resp);
                }

                return handleOauthParamsValidation(resp);
            }
        },
    );
}

function handleOauthParamsValidation(
    resp: {
        [key: string]: any;
        userMessage?: string;
    } = {},
) {
    dispatchBsod();
    localStorage.removeItem('oauthData');

    // eslint-disable-next-line no-alert
    resp.userMessage && setTimeout(() => alert(resp.userMessage), 500); // 500 ms to allow re-render

    return Promise.reject(resp);
}

interface SetClientAction extends ReduxAction {
    type: 'set_client';
    payload: Client;
}

export function setClient(payload: Client): SetClientAction {
    return {
        type: 'set_client',
        payload,
    };
}

export type ClientAction = SetClientAction;

interface SetOauthAction extends ReduxAction {
    type: 'set_oauth';
    payload: Pick<OAuthState, 'clientId' | 'redirectUrl' | 'responseType' | 'scope' | 'prompt' | 'loginHint' | 'state'>;
}

// Input data is coming right from the query string, so the names
// are the same, as used for initializing OAuth2 request
export function setOAuthRequest(data: {
    client_id?: string;
    redirect_uri?: string;
    response_type?: string;
    scope?: string;
    prompt?: string;
    loginHint?: string;
    state?: string;
}): SetOauthAction {
    return {
        type: 'set_oauth',
        payload: {
            // TODO: there is too much default empty string. Maybe we can somehow validate it
            //       on the level, where this action is called?
            clientId: data.client_id || '',
            redirectUrl: data.redirect_uri || '',
            responseType: data.response_type || '',
            scope: data.scope || '',
            prompt: data.prompt || '',
            loginHint: data.loginHint || '',
            state: data.state || '',
        },
    };
}

interface SetOAuthResultAction extends ReduxAction {
    type: 'set_oauth_result';
    payload: Pick<OAuthState, 'success' | 'code' | 'displayCode'>;
}

export const SET_OAUTH_RESULT = 'set_oauth_result'; // TODO: remove

export function setOAuthCode(payload: { success: boolean; code: string; displayCode: boolean }): SetOAuthResultAction {
    return {
        type: 'set_oauth_result',
        payload,
    };
}

export function resetOAuth(): AppAction {
    return (dispatch): void => {
        localStorage.removeItem('oauthData');
        dispatch(setOAuthRequest({}));
    };
}

/**
 * Resets all temporary state related to auth
 */
export function resetAuth(): AppAction {
    return (dispatch, getSate): Promise<void> => {
        dispatch(setLogin(null));
        dispatch(resetOAuth());
        // ensure current account is valid
        const activeAccount = getActiveAccount(getSate());

        if (activeAccount) {
            return Promise.resolve(dispatch(authenticate(activeAccount)))
                .then(() => {})
                .catch(() => {
                    // its okay. user will be redirected to an appropriate place
                });
        }

        return Promise.resolve();
    };
}

interface RequestPermissionsAcceptAction extends ReduxAction {
    type: 'require_permissions_accept';
}

export function requirePermissionsAccept(): RequestPermissionsAcceptAction {
    return {
        type: 'require_permissions_accept',
    };
}

export type OAuthAction = SetOauthAction | SetOAuthResultAction | RequestPermissionsAcceptAction;

interface SetScopesAction extends ReduxAction {
    type: 'set_scopes';
    payload: Array<Scope>;
}

export function setScopes(payload: Array<Scope>): SetScopesAction {
    return {
        type: 'set_scopes',
        payload,
    };
}

export type ScopesAction = SetScopesAction;

interface SetLoadingAction extends ReduxAction {
    type: 'set_loading_state';
    payload: boolean;
}

export function setLoadingState(isLoading: boolean): SetLoadingAction {
    return {
        type: 'set_loading_state',
        payload: isLoading,
    };
}

function wrapInLoader<T>(fn: AppAction<Promise<T>>): AppAction<Promise<T>> {
    return (dispatch, getState) => {
        dispatch(setLoadingState(true));
        const endLoading = () => dispatch(setLoadingState(false));

        return fn(dispatch, getState, undefined).then(
            (resp) => {
                endLoading();

                return resp;
            },
            (resp) => {
                endLoading();

                return Promise.reject(resp);
            },
        );
    };
}

export type LoadingAction = SetLoadingAction;

function needActivation() {
    return updateUser({
        isActive: false,
        isGuest: false,
    });
}

function authHandler(dispatch: Dispatch) {
    return (oAuthResp: OAuthResponse): Promise<Account> =>
        dispatch(
            authenticate({
                token: oAuthResp.access_token,
                refreshToken: oAuthResp.refresh_token || null,
            }),
        ).then((resp) => {
            dispatch(setLogin(null));

            return resp;
        });
}

function validationErrorsHandler(
    dispatch: Dispatch,
    repeatUrl?: string,
): (
    resp: Resp<{
        errors?: Record<string, string | ValidationError>;
        data?: Record<string, any>;
    }>,
) => Promise<never> {
    return (resp) => {
        if (resp.errors) {
            const [firstError] = Object.keys(resp.errors);
            const firstErrorObj: ValidationError = {
                type: resp.errors[firstError] as string,
                payload: {
                    isGuest: true,
                    repeatUrl: '',
                },
            };

            if (resp.data) {
                // TODO: this should be formatted on backend
                Object.assign(firstErrorObj.payload, resp.data);
            }

            if (['error.key_not_exists', 'error.key_expire'].includes(firstErrorObj.type) && repeatUrl) {
                // TODO: this should be formatted on backend
                firstErrorObj.payload.repeatUrl = repeatUrl;
            }

            // TODO: can I clone the object or its necessary to catch modified errors list on corresponding catches?
            const { errors } = resp;
            errors[firstError] = firstErrorObj;

            dispatch(setErrors(errors));
        }

        return Promise.reject(resp);
    };
}

export type Action =
    | ErrorAction
    | CredentialsAction
    | AccountSwitcherAction
    | LoadingAction
    | ClientAction
    | OAuthAction
    | ScopesAction;
