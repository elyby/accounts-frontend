// @flow
import { browserHistory } from 'services/history';

import logger from 'services/logger';
import localStorage from 'services/localStorage';
import loader from 'services/loader';
import history from 'services/history';
import { updateUser, acceptRules as userAcceptRules } from 'components/user/actions';
import { authenticate, logoutAll } from 'components/accounts/actions';
import authentication from 'services/api/authentication';
import oauth from 'services/api/oauth';
import signup from 'services/api/signup';
import dispatchBsod from 'components/ui/bsod/dispatchBsod';
import { create as createPopup } from 'components/ui/popup/actions';
import ContactForm from 'components/contact/ContactForm';

export { updateUser } from 'components/user/actions';
export { authenticate, logoutAll as logout } from 'components/accounts/actions';

/**
 * Reoutes user to the previous page if it is possible
 *
 * @param {string} fallbackUrl - an url to route user to if goBack is not possible
 *
 * @return {object} - action definition
 */
export function goBack(fallbackUrl?: ?string = null) {
    if (history.canGoBack()) {
        browserHistory.goBack();
    } else if (fallbackUrl) {
        browserHistory.push(fallbackUrl);
    }

    return {
        type: 'noop'
    };
}

export function redirect(url: string): () => Promise<*> {
    loader.show();

    return () => new Promise(() => {
        // do not resolve promise to make loader visible and
        // overcome app rendering
        location.href = url;
    });
}

export function login({
    login = '',
    password = '',
    totp,
    rememberMe = false
}: {
    login: string,
    password?: string,
    totp?: string,
    rememberMe?: bool
}) {
    const PASSWORD_REQUIRED = 'error.password_required';
    const LOGIN_REQUIRED = 'error.login_required';
    const ACTIVATION_REQUIRED = 'error.account_not_activated';
    const TOTP_REQUIRED = 'error.totp_required';

    return wrapInLoader((dispatch) =>
        authentication.login(
            {login, password, totp, rememberMe}
        )
            .then(authHandler(dispatch))
            .catch((resp) => {
                if (resp.errors) {
                    if (resp.errors.password === PASSWORD_REQUIRED) {
                        return dispatch(setLogin(login));
                    } else if (resp.errors.login === ACTIVATION_REQUIRED) {
                        return dispatch(needActivation());
                    } else if (resp.errors.totp === TOTP_REQUIRED) {
                        return dispatch(requestTotp({
                            login,
                            password,
                            rememberMe
                        }));
                    } else if (resp.errors.login === LOGIN_REQUIRED && password) {
                        logger.warn('No login on password panel');

                        return dispatch(logoutAll());
                    }
                }

                return validationErrorsHandler(dispatch)(resp);
            })
    );
}

export function acceptRules() {
    return wrapInLoader((dispatch) =>
        dispatch(userAcceptRules())
            .catch(validationErrorsHandler(dispatch))
    );
}

export function forgotPassword({
    login = '',
    captcha = ''
}: {
    login: string,
    captcha: string
}) {
    return wrapInLoader((dispatch, getState) =>
        authentication.forgotPassword({login, captcha})
            .then(({data = {}}) => dispatch(updateUser({
                maskedEmail: data.emailMask || getState().user.email
            })))
            .catch(validationErrorsHandler(dispatch))
    );
}

export function recoverPassword({
    key = '',
    newPassword = '',
    newRePassword = ''
}: {
    key: string,
    newPassword: string,
    newRePassword: string
}) {
    return wrapInLoader((dispatch) =>
        authentication.recoverPassword({key, newPassword, newRePassword})
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/forgot-password'))
    );
}

export function register({
    email = '',
    username = '',
    password = '',
    rePassword = '',
    captcha = '',
    rulesAgreement = false
}: {
    email: string,
    username: string,
    password: string,
    rePassword: string,
    captcha: string,
    rulesAgreement: bool
}) {
    return wrapInLoader((dispatch, getState) =>
        signup.register({
            email, username,
            password, rePassword,
            rulesAgreement, lang: getState().user.lang,
            captcha
        })
            .then(() => {
                dispatch(updateUser({
                    username,
                    email
                }));

                dispatch(needActivation());

                browserHistory.push('/activation');
            })
            .catch(validationErrorsHandler(dispatch))
    );
}

export function activate({key = ''}: {key: string}) {
    return wrapInLoader((dispatch) =>
        signup.activate({key})
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/resend-activation'))
    );
}

export function resendActivation({
    email = '',
    captcha
}: {
    email: string,
    captcha: string
}) {
    return wrapInLoader((dispatch) =>
        signup.resendActivation({email, captcha})
            .then((resp) => {
                dispatch(updateUser({
                    email
                }));

                return resp;
            })
            .catch(validationErrorsHandler(dispatch))
    );
}

export function contactUs() {
    return createPopup(ContactForm);
}

export const SET_CREDENTIALS = 'auth:setCredentials';
/**
 * Sets login in credentials state
 *
 * Resets the state, when `null` is passed
 *
 * @param {string|null} login
 *
 * @return {object}
 */
export function setLogin(login: ?string) {
    return {
        type: SET_CREDENTIALS,
        payload: login ? {
            login
        } : null
    };
}

function requestTotp({login, password, rememberMe}: {
    login: string,
    password: string,
    rememberMe: bool
}) {
    return {
        type: SET_CREDENTIALS,
        payload: {
            login,
            password,
            rememberMe,
            isTotpRequired: true
        }
    };
}

export const SET_SWITCHER = 'auth:setAccountSwitcher';
export function setAccountSwitcher(isOn: bool) {
    return {
        type: SET_SWITCHER,
        payload: isOn
    };
}

export const ERROR = 'auth:error';
export function setErrors(errors: ?{[key: string]: string}) {
    return {
        type: ERROR,
        payload: errors,
        error: true
    };
}

export function clearErrors() {
    return setErrors(null);
}

const KNOWN_SCOPES = [
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
 * @return {Promise}
 */
export function oAuthValidate(oauthData: {
    clientId: string,
    redirectUrl: string,
    responseType: string,
    description: string,
    scope: string,
    prompt: 'none'|'consent'|'select_account',
    loginHint?: string,
    state?: string
}) {
    // TODO: move to oAuth actions?
    // test request: /oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session&description=foo
    return wrapInLoader((dispatch) =>
        oauth.validate(oauthData)
            .then((resp) => {
                const scopes = resp.session.scopes;
                const invalidScopes = scopes.filter((scope) => !KNOWN_SCOPES.includes(scope));
                let prompt = (oauthData.prompt || 'none').split(',').map((item) => item.trim);

                if (prompt.includes('none')) {
                    prompt = ['none'];
                }

                if (invalidScopes.length) {
                    logger.error('Got invalid scopes after oauth validation', {
                        invalidScopes
                    });
                }

                dispatch(setClient(resp.client));
                dispatch(setOAuthRequest({
                    ...resp.oAuth,
                    prompt: oauthData.prompt || 'none',
                    loginHint: oauthData.loginHint
                }));
                dispatch(setScopes(scopes));
                localStorage.setItem('oauthData', JSON.stringify({ // @see services/authFlow/AuthFlow
                    timestamp: Date.now(),
                    payload: oauthData
                }));
            })
            .catch(handleOauthParamsValidation)
    );
}

/**
 * @param {object} params
 * @param {bool} params.accept=false
 *
 * @return {Promise}
 */
export function oAuthComplete(params: {accept?: bool} = {}) {
    return wrapInLoader((dispatch, getState) =>
        oauth.complete(getState().auth.oauth, params)
            .then((resp) => {
                localStorage.removeItem('oauthData');

                if (resp.redirectUri.startsWith('static_page')) {
                    resp.code = resp.redirectUri.match(/code=(.+)&/)[1];
                    resp.redirectUri = resp.redirectUri.match(/^(.+)\?/)[1];
                    resp.displayCode = resp.redirectUri === 'static_page_with_code';

                    dispatch(setOAuthCode({
                        success: resp.success,
                        code: resp.code,
                        displayCode: resp.displayCode
                    }));
                }

                return resp;
            }, (resp) => {
                if (resp.acceptRequired) {
                    dispatch(requirePermissionsAccept());

                    return Promise.reject(resp);
                }

                return handleOauthParamsValidation(resp);
            })
    );
}

function handleOauthParamsValidation(resp = {}) {
    dispatchBsod();
    localStorage.removeItem('oauthData');

    // eslint-disable-next-line no-alert
    resp.userMessage && setTimeout(() => alert(resp.userMessage), 500); // 500 ms to allow re-render

    return Promise.reject(resp);
}

export const SET_CLIENT = 'set_client';
export function setClient({
    id,
    name,
    description
}: {
    id: string,
    name: string,
    description: string
}) {
    return {
        type: SET_CLIENT,
        payload: {id, name, description}
    };
}

export function resetOAuth() {
    return (dispatch: (Function|Object) => void) => {
        localStorage.removeItem('oauthData');
        dispatch(setOAuthRequest({}));
    };
}

/**
 * Resets all temporary state related to auth
 *
 * @return {function}
 */
export function resetAuth() {
    return (dispatch: (Function|Object) => void) => {
        dispatch(setLogin(null));
        dispatch(resetOAuth());
    };
}

export const SET_OAUTH = 'set_oauth';
export function setOAuthRequest(oauth: {
    client_id?: string,
    redirect_uri?: string,
    response_type?: string,
    scope?: string,
    prompt?: string,
    loginHint?: string,
    state?: string
}) {
    return {
        type: SET_OAUTH,
        payload: {
            clientId: oauth.client_id,
            redirectUrl: oauth.redirect_uri,
            responseType: oauth.response_type,
            scope: oauth.scope,
            prompt: oauth.prompt,
            loginHint: oauth.loginHint,
            state: oauth.state
        }
    };
}

export const SET_OAUTH_RESULT = 'set_oauth_result';
export function setOAuthCode(oauth: {
    success: bool,
    code: string,
    displayCode: bool
}) {
    return {
        type: SET_OAUTH_RESULT,
        payload: {
            success: oauth.success,
            code: oauth.code,
            displayCode: oauth.displayCode
        }
    };
}

export const REQUIRE_PERMISSIONS_ACCEPT = 'require_permissions_accept';
export function requirePermissionsAccept() {
    return {
        type: REQUIRE_PERMISSIONS_ACCEPT
    };
}

export const SET_SCOPES = 'set_scopes';
export function setScopes(scopes: Array<string>) {
    if (!(scopes instanceof Array)) {
        throw new Error('Scopes must be array');
    }

    return {
        type: SET_SCOPES,
        payload: scopes
    };
}


export const SET_LOADING_STATE = 'set_loading_state';
export function setLoadingState(isLoading: bool) {
    return {
        type: SET_LOADING_STATE,
        payload: isLoading
    };
}

function wrapInLoader(fn) {
    return (dispatch: (Function|Object) => void, getState: Object) => {
        dispatch(setLoadingState(true));
        const endLoading = () => dispatch(setLoadingState(false));

        return Reflect.apply(fn, null, [dispatch, getState]).then((resp) => {
            endLoading();

            return resp;
        }, (resp) => {
            endLoading();

            return Promise.reject(resp);
        });
    };
}

function needActivation() {
    return updateUser({
        isActive: false,
        isGuest: false
    });
}

function authHandler(dispatch) {
    return (resp) => dispatch(authenticate({
        token: resp.access_token,
        refreshToken: resp.refresh_token
    })).then((resp) => {
        dispatch(setLogin(null));

        return resp;
    });
}

function validationErrorsHandler(dispatch: (Function | Object) => void, repeatUrl?: string) {
    return (resp) => {
        if (resp.errors) {
            const firstError = Object.keys(resp.errors)[0];
            const error = {
                type: resp.errors[firstError],
                payload: {
                    isGuest: true,
                    repeatUrl: ''
                }
            };

            if (resp.data) {
                // TODO: this should be formatted on backend
                Object.assign(error.payload, resp.data);
            }

            if (['error.key_not_exists', 'error.key_expire'].includes(error.type) && repeatUrl) {
                // TODO: this should be formatted on backend
                error.payload.repeatUrl = repeatUrl;
            }

            resp.errors[firstError] = error;

            dispatch(setErrors(resp.errors));
        }

        return Promise.reject(resp);
    };
}
