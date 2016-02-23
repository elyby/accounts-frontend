import { routeActions } from 'react-router-redux';

import { updateUser, logout as logoutUser } from 'components/user/actions';
import request from 'services/request';

export function login({login = '', password = '', rememberMe = false}) {
    const PASSWORD_REQUIRED = 'error.password_required';
    const LOGIN_REQUIRED = 'error.login_required';

    return (dispatch) =>
        request.post(
            '/api/authentication/login',
            {login, password, rememberMe}
        )
        .then(() => {
            dispatch(updateUser({
                isGuest: false
            }));

            dispatch(redirectToGoal());
        })
        .catch((resp) => {
            if (resp.errors.password === PASSWORD_REQUIRED) {
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
        })
        ;
}

export function activate({key = ''}) {
    return (dispatch) =>
        request.post(
            '/api/signup/confirm',
            {key}
        )
        .then(() => {
            dispatch(updateUser({
                isActive: true
            }));

            dispatch(redirectToGoal());
        })
        .catch((resp) => {
            const errorMessage = resp.errors[Object.keys(resp.errors)[0]];
            dispatch(setError(errorMessage));
        })
        ;
}

function redirectToGoal() {
    return routeActions.push('/oauth/permissions');
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
