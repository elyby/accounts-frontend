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

    const onEnter = {
        onEnter: ({location}, replace) => authFlow.handleRequest(location.pathname, replace)
    };

    return (
        <Route path="/" component={RootPage}>
            <IndexRoute component={IndexPage} {...onEnter} />

            <Route path="oauth" component={OAuthInit} {...onEnter} />

            <Route path="auth" component={AuthPage}>
                <Route path="/login" components={new Login()} {...onEnter} />
                <Route path="/password" components={new Password()} {...onEnter} />
                <Route path="/register" components={new Register()} {...onEnter} />
                <Route path="/activation" components={new Activation()} {...onEnter} />
                <Route path="/oauth/permissions" components={new Permissions()} {...onEnter} />
                <Route path="/oauth/finish" component={Finish} {...onEnter} />
                <Route path="/change-password" components={new ChangePassword()} {...onEnter} />
                <Route path="/forgot-password" components={new ForgotPassword()} {...onEnter} />
            </Route>

            <Route path="profile" component={ProfilePage}>
                <Route path="change-password" component={ProfileChangePasswordPage} />
                <Route path="change-username" component={ProfileChangeUsernamePage} />
                <Route path="change-email" component={ProfileChangeEmailPage} />
            </Route>
        </Route>
    );
}
