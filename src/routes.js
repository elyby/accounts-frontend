import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RootPage from 'pages/root/RootPage';
import IndexPage from 'pages/index/IndexPage';
import AuthPage from 'pages/auth/AuthPage';

import ProfilePage from 'pages/profile/ProfilePage';
import ProfileChangePasswordPage from 'pages/profile/ChangePasswordPage';
import ProfileChangeUsernamePage from 'pages/profile/ChangeUsernamePage';
import ProfileChangeEmailPage from 'pages/profile/ProfileChangeEmailPage';

import OAuthInit from 'components/auth/OAuthInit';
import Register from 'components/auth/register/Register';
import Login from 'components/auth/login/Login';
import Permissions from 'components/auth/permissions/Permissions';
import Activation from 'components/auth/activation/Activation';
import Password from 'components/auth/password/Password';
import ChangePassword from 'components/auth/changePassword/ChangePassword';
import ForgotPassword from 'components/auth/forgotPassword/ForgotPassword';
import Finish from 'components/auth/finish/Finish';


import authFlow from 'services/authFlow';

export default function routesFactory(store) {
    authFlow.setStore(store);

    const startAuthFlow = {
        onEnter: ({location}, replace) => authFlow.handleRequest(location.pathname, replace)
    };

    const userOnly = {
        onEnter: ({location}, replace) => {
            const {user} = store.getState();

            if (user.isGuest) {
                replace('/');
            }
        }
    };

    return (
        <Route path="/" component={RootPage}>
            <IndexRoute component={IndexPage} {...startAuthFlow} />

            <Route path="oauth" component={OAuthInit} {...startAuthFlow} />

            <Route path="auth" component={AuthPage} {...startAuthFlow}>
                <Route path="/login" components={new Login()} />
                <Route path="/password" components={new Password()} />
                <Route path="/register" components={new Register()} />
                <Route path="/activation" components={new Activation()} />
                <Route path="/oauth/permissions" components={new Permissions()} />
                <Route path="/oauth/finish" component={Finish} />
                <Route path="/change-password" components={new ChangePassword()} />
                <Route path="/forgot-password" components={new ForgotPassword()} />
            </Route>

            <Route path="profile" component={ProfilePage} {...userOnly}>
                <Route path="change-password" component={ProfileChangePasswordPage} />
                <Route path="change-username" component={ProfileChangeUsernamePage} />
                <Route path="change-email" component={ProfileChangeEmailPage} />
            </Route>
        </Route>
    );
}
