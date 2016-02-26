import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RootPage from 'pages/root/RootPage';
import IndexPage from 'pages/index/IndexPage';
import AuthPage from 'pages/auth/AuthPage';

import { authenticate, updateUser } from 'components/user/actions';

import OAuthInit from 'components/auth/OAuthInit';
import Register from 'components/auth/Register';
import Login from 'components/auth/Login';
import Permissions from 'components/auth/Permissions';
import Activation from 'components/auth/Activation';
import Password from 'components/auth/Password';
import Logout from 'components/auth/Logout';
import PasswordChange from 'components/auth/PasswordChange';

export default function routesFactory(store) {
    function checkAuth(nextState, replace) {
        const state = store.getState();
        const pathname = state.routing.location.pathname;

        let forcePath;
        let goal;
        if (!state.user.isGuest) {
            if (!state.user.isActive) {
                forcePath = '/activation';
            } else if (!state.user.shouldChangePassword) {
                forcePath = '/password-change';
            }
        } else {
            if (state.user.email || state.user.username) {
                forcePath = '/password';
            } else {
                forcePath = '/login';
            }
        }

        if (forcePath && pathname !== forcePath) {
            switch (pathname) {
                case '/':
                    goal = 'account';
                    break;

                case '/oauth/permissions':
                    goal = 'oauth';
                    break;
            }

            if (goal) {
                store.dispatch(updateUser({ // TODO: mb create action resetGoal?
                    goal
                }));
            }

            replace({pathname: forcePath});
        }
    }

    const state = store.getState();
    if (state.user.token) {
        // authorizing user if it is possible
        store.dispatch(authenticate(state.user.token));
    }

    return (
        <Route path="/" component={RootPage}>
            <IndexRoute component={IndexPage} onEnter={checkAuth} />

            <Route path="auth" component={AuthPage}>
                <Route path="/login" components={new Login()} onEnter={checkAuth} />
                <Route path="/password" components={new Password()} onEnter={checkAuth} />
                <Route path="/register" components={new Register()} />
                <Route path="/activation" components={new Activation()} />
                <Route path="/oauth/permissions" components={new Permissions()} onEnter={checkAuth} />
                <Route path="/password-change" components={new PasswordChange()} />
            </Route>

            <Route path="oauth" component={OAuthInit} />
            <Route path="logout" component={Logout} />
        </Route>
    );
}
