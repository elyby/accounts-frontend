import { routeActions } from 'react-router-redux';

import { updateUser, logout as logoutUser, acceptRules as userAcceptRules } from 'components/user/actions';
import { authenticate } from 'components/accounts/actions';
import authentication from 'services/api/authentication';
import oauth from 'services/api/oauth';
import signup from 'services/api/signup';
import dispatchBsod from 'components/ui/bsod/dispatchBsod';

export function login({login = '', password = '', rememberMe = false}) {
    const PASSWORD_REQUIRED = 'error.password_required';
    const LOGIN_REQUIRED = 'error.login_required';
    const ACTIVATION_REQUIRED = 'error.account_not_activated';

    return wrapInLoader((dispatch) =>
        authentication.login(
            {login, password, rememberMe}
        )
        .then(authHandler(dispatch))
        .catch((resp) => {
            if (resp.errors) {
                if (resp.errors.password === PASSWORD_REQUIRED) {
                    return dispatch(setLogin(login));
                } else if (resp.errors.login === ACTIVATION_REQUIRED) {
                    return dispatch(needActivation());
                } else if (resp.errors.login === LOGIN_REQUIRED && password) {
                    // return to the first step
                    return dispatch(logout());
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
    login = ''
}) {
    return wrapInLoader((dispatch, getState) =>
        authentication.forgotPassword({login})
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
            dispatch(routeActions.push('/activation'));
        })
        .catch(validationErrorsHandler(dispatch))
    );
}

export function activate({key = ''}) {
    return wrapInLoader((dispatch) =>
        signup.activate({key})
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/resend-activation'))
    );
}

export function resendActivation({email = '', captcha}) {
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

export const SET_LOGIN = 'auth:setLogin';
export function setLogin(login) {
    return {
        type: SET_LOGIN,
        payload: login
    };
}

export const SET_SWITCHER = 'auth:setAccountSwitcher';
export function setAccountSwitcher(isOn) {
    return {
        type: SET_SWITCHER,
        payload: isOn
    };
}

export const ERROR = 'auth:error';
export function setErrors(errors) {
    return {
        type: ERROR,
        payload: errors,
        error: true
    };
}

export function clearErrors() {
    return setErrors(null);
}

export function logout() {
    return logoutUser();
}

/**
 * @param {object} oauthData
 * @param {string} oauthData.clientId
 * @param {string} oauthData.redirectUrl
 * @param {string} oauthData.responseType
 * @param {string} oauthData.description
 * @param {string} oauthData.scope
 * @param {string} oauthData.state
 *
 * @return {Promise}
 */
export function oAuthValidate(oauthData) {
    // TODO: move to oAuth actions?
    // test request: /oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session&description=foo
    return wrapInLoader((dispatch) =>
        oauth.validate(oauthData)
            .then((resp) => {
                dispatch(setClient(resp.client));
                dispatch(setOAuthRequest(resp.oAuth));
                dispatch(setScopes(resp.session.scopes));
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
export function oAuthComplete(params = {}) {
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
export function setClient({id, name, description}) {
    return {
        type: SET_CLIENT,
        payload: {id, name, description}
    };
}

export const SET_OAUTH = 'set_oauth';
export function setOAuthRequest(oauth) {
    return {
        type: SET_OAUTH,
        payload: {
            clientId: oauth.client_id,
            redirectUrl: oauth.redirect_uri,
            responseType: oauth.response_type,
            scope: oauth.scope,
            state: oauth.state
        }
    };
}

export const SET_OAUTH_RESULT = 'set_oauth_result';
export function setOAuthCode(oauth) {
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
export function setScopes(scopes) {
    if (!(scopes instanceof Array)) {
        throw new Error('Scopes must be array');
    }

    return {
        type: SET_SCOPES,
        payload: scopes
    };
}


export const SET_LOADING_STATE = 'set_loading_state';
export function setLoadingState(isLoading) {
    return {
        type: SET_LOADING_STATE,
        payload: isLoading
    };
}

function wrapInLoader(fn) {
    return (dispatch, getState) => {
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

function validationErrorsHandler(dispatch, repeatUrl) {
    return (resp) => {
        if (resp.errors) {
            const firstError = Object.keys(resp.errors)[0];
            const error = {
                type: resp.errors[firstError],
                payload: {
                    isGuest: true
                }
            };

            if (resp.data) {
                // TODO: this should be formatted on backend
                Object.assign(error.payload, resp.data);
            }

            if (['error.key_not_exists', 'error.key_expire'].includes(error.type) && repeatUrl) {
                // TODO: this should be formatted on backend
                Object.assign(error.payload, {
                    repeatUrl
                });
            }

            resp.errors[firstError] = error;

            dispatch(setErrors(resp.errors));
        }

        return Promise.reject(resp);
    };
}
