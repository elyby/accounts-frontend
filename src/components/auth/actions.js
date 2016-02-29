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

            dispatch(authenticate(resp.jwt));

            dispatch(redirectToGoal());
        })
        .catch((resp) => {
            if (resp.errors.login === ACTIVATION_REQUIRED) {
                dispatch(updateUser({
                    isActive: false,
                    isGuest: false
                }));

                dispatch(redirectToGoal());
            } else if (resp.errors.password === PASSWORD_REQUIRED) {
                dispatch(updateUser({
                    username: login,
                    email: login
                }));
                dispatch(routeActions.push('/password'));
            } else {
                if (resp.errors.login === LOGIN_REQUIRED && password) {
                    dispatch(logout());
                }
                const errorMessage = resp.errors[Object.keys(resp.errors)[0]];
                dispatch(setError(errorMessage));
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
                isActive: true
            }));

            dispatch(authenticate(resp.jwt));

            dispatch(redirectToGoal());
        })
        .catch((resp) => {
            const errorMessage = resp.errors[Object.keys(resp.errors)[0]];
            dispatch(setError(errorMessage));

            // TODO: log unexpected errors
        })
        ;
}

function redirectToGoal() {
    return (dispatch, getState) => {
        const {user} = getState();

        switch (user.goal) {
            case 'oauth':
                dispatch(routeActions.push('/oauth/permissions'));
                break;

            case 'account':
            default:
                dispatch(routeActions.push('/'));
                break;
        }

        // dispatch(updateUser({ // TODO: mb create action resetGoal?
        //     goal: null
        // }));
    };
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
    return (dispatch) => {
        dispatch(logoutUser());
        dispatch(routeActions.push('/login'));
    };
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
        .then((resp) => {
            if (resp.status === 401 && resp.name === 'Unauthorized') {
                // TODO: temporary solution for oauth init by guest
                // TODO: request serivce should handle http status codes
                dispatch(routeActions.push('/oauth/permissions'));
                return;
            }

            if (resp.redirectUri) {
                location.href = resp.redirectUri;
            }
        })
        .catch((resp = {}) => { // TODO
            handleOauthParamsValidation(resp);

            if (resp.statusCode === 401 && resp.error === 'accept_required') {
                dispatch(routeActions.push('/oauth/permissions'));
            }

            if (resp.statusCode === 401 && resp.error === 'access_denied') {
                // user declined permissions
                location.href = resp.redirectUri;
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
    if (resp.statusCode === 400 && resp.error === 'invalid_request') {
        alert(`Invalid request (${resp.parameter} required).`);
    }
    if (resp.statusCode === 400 && resp.error === 'unsupported_response_type') {
        alert(`Invalid response type '${resp.parameter}'.`);
    }
    if (resp.statusCode === 400 && resp.error === 'invalid_scope') {
        alert(`Invalid scope '${resp.parameter}'.`);
    }
    if (resp.statusCode === 401 && resp.error === 'invalid_client') {
        alert('Can not find application you are trying to authorize.');
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
