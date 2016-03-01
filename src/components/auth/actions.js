import { routeActions } from 'react-router-redux';

import { updateUser, logout as logoutUser, authenticate } from 'components/user/actions';
import request from 'services/request';

export function login({login = '', password = '', rememberMe = false}) {
    const PASSWORD_REQUIRED = 'error.password_required';
    const LOGIN_REQUIRED = 'error.login_required';
    const ACTIVATION_REQUIRED = 'error.account_not_activated';

    return (dispatch) =>
        request.post(
            '/api/authentication/login',
            {login, password, rememberMe}
        )
        .then((resp) => {
            dispatch(updateUser({
                isGuest: false,
                token: resp.jwt
            }));

            return dispatch(authenticate(resp.jwt));
        })
        .catch((resp) => {
            if (resp.errors.login === ACTIVATION_REQUIRED) {
                return dispatch(updateUser({
                    isActive: false,
                    isGuest: false
                }));
            } else if (resp.errors.password === PASSWORD_REQUIRED) {
                return dispatch(updateUser({
                    username: login,
                    email: login
                }));
            } else {
                if (resp.errors.login === LOGIN_REQUIRED && password) {
                    dispatch(logout());
                }
                const errorMessage = resp.errors[Object.keys(resp.errors)[0]];
                dispatch(setError(errorMessage));
                throw new Error(errorMessage);
            }

            // TODO: log unexpected errors
        })
        ;
}

export function register({
    email = '',
    username = '',
    password = '',
    rePassword = '',
    rulesAgreement = false
}) {
    return (dispatch) =>
        request.post(
            '/api/signup',
            {email, username, password, rePassword, rulesAgreement}
        )
        .then(() => {
            dispatch(updateUser({
                username,
                email,
                isGuest: false
            }));
            dispatch(routeActions.push('/activation'));
        })
        .catch((resp) => {
            const errorMessage = resp.errors[Object.keys(resp.errors)[0]];
            dispatch(setError(errorMessage));
            throw new Error(errorMessage);

            // TODO: log unexpected errors
        })
        ;
}

export function activate({key = ''}) {
    return (dispatch) =>
        request.post(
            '/api/signup/confirm',
            {key}
        )
        .then((resp) => {
            dispatch(updateUser({
                isGuest: false,
                isActive: true
            }));

            return dispatch(authenticate(resp.jwt));
        })
        .catch((resp) => {
            const errorMessage = resp.errors[Object.keys(resp.errors)[0]];
            dispatch(setError(errorMessage));
            throw new Error(errorMessage);

            // TODO: log unexpected errors
        })
        ;
}

export const ERROR = 'error';
export function setError(error) {
    return {
        type: ERROR,
        payload: error,
        error: true
    };
}

export function clearErrors() {
    return setError(null);
}

export function logout() {
    return logoutUser();
}

// TODO: move to oAuth actions?
// test request: /oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session
export function oAuthValidate(oauth) {
    return (dispatch) =>
        request.get(
            '/api/oauth/validate',
            getOAuthRequest(oauth)
        )
        .then((resp) => {
            dispatch(setClient(resp.client));
            dispatch(setOAuthRequest(resp.oAuth));
            dispatch(setScopes(resp.session.scopes));
        })
        .catch((resp = {}) => { // TODO
            handleOauthParamsValidation(resp);
            if (resp.statusCode === 401 && resp.error === 'accept_required') {
                alert('Accept required.');
            }
        });
}

export function oAuthComplete(params = {}) {
    return (dispatch, getState) => {
        const oauth = getState().auth.oauth;
        const query = request.buildQuery(getOAuthRequest(oauth));

        return request.post(
            `/api/oauth/complete?${query}`,
            typeof params.accept === 'undefined' ? {} : {accept: params.accept}
        )
        .catch((resp = {}) => { // TODO
            if (resp.statusCode === 401 && resp.error === 'access_denied') {
                // user declined permissions
                return {
                    redirectUri: resp.redirectUri
                };
            }

            handleOauthParamsValidation(resp);

            if (resp.status === 401 && resp.name === 'Unauthorized') {
                const error = new Error('Unauthorized');
                error.unauthorized = true;
                throw error;
            }

            if (resp.statusCode === 401 && resp.error === 'accept_required') {
                const error = new Error('Permissions accept required');
                error.acceptRequired = true;
                throw error;
            }
        });
    };
}

function getOAuthRequest(oauth) {
    return {
        client_id: oauth.clientId,
        redirect_uri: oauth.redirectUrl,
        response_type: oauth.responseType,
        scope: oauth.scope,
        state: oauth.state
    };
}

function handleOauthParamsValidation(resp = {}) {
    const error = new Error('Error completing request');
    if (resp.statusCode === 400 && resp.error === 'invalid_request') {
        alert(`Invalid request (${resp.parameter} required).`);
        throw error;
    }
    if (resp.statusCode === 400 && resp.error === 'unsupported_response_type') {
        alert(`Invalid response type '${resp.parameter}'.`);
        throw error;
    }
    if (resp.statusCode === 400 && resp.error === 'invalid_scope') {
        alert(`Invalid scope '${resp.parameter}'.`);
        throw error;
    }
    if (resp.statusCode === 401 && resp.error === 'invalid_client') {
        alert('Can not find application you are trying to authorize.');
        throw error;
    }
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
