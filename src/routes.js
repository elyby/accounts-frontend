import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RootPage from 'pages/root/RootPage';
import IndexPage from 'pages/index/IndexPage';
import AuthPage from 'pages/auth/AuthPage';

import Register from 'components/auth/Register';
import Login from 'components/auth/Login';
import Permissions from 'components/auth/Permissions';
import Activation from 'components/auth/Activation';
import Password from 'components/auth/Password';
import Logout from 'components/auth/Logout';

export default function routesFactory(store) {
    function checkAuth(nextState, replace) {
        const state = store.getState();

        let forcePath;
        if (!state.user.isGuest) {
            if (!state.user.isActive) {
                forcePath = '/activation';
            } else {
                forcePath = '/oauth/permissions';
            }
        } else {
            if (state.user.email || state.user.username) {
                forcePath = '/password';
            } else {
                forcePath = '/login';
            }
        }

        if (forcePath && state.routing.location.pathname !== forcePath) {
            replace({pathname: forcePath});
        }
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
                <Route path="/oauth/:id" component={Permissions} />
            </Route>

            <Route path="logout" component={Logout} />
        </Route>
    );
}
