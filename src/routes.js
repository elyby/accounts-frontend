import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RootPage from 'pages/root/RootPage';
import IndexPage from 'pages/index/IndexPage';
import AuthPage from 'pages/auth/AuthPage';

import RulesPage from 'pages/rules/RulesPage';
import PageNotFound from 'pages/404/PageNotFound';

import ProfilePage from 'pages/profile/ProfilePage';
import ProfileChangePasswordPage from 'pages/profile/ChangePasswordPage';
import ProfileChangeUsernamePage from 'pages/profile/ChangeUsernamePage';
import ProfileChangeEmailPage from 'pages/profile/ChangeEmailPage';

import OAuthInit from 'components/auth/OAuthInit';
import Register from 'components/auth/register/Register';
import Login from 'components/auth/login/Login';
import Permissions from 'components/auth/permissions/Permissions';
import Activation from 'components/auth/activation/Activation';
import ResendActivation from 'components/auth/resendActivation/ResendActivation';
import Password from 'components/auth/password/Password';
import ChangePassword from 'components/auth/changePassword/ChangePassword';
import ForgotPassword from 'components/auth/forgotPassword/ForgotPassword';
import RecoverPassword from 'components/auth/recoverPassword/RecoverPassword';
import Finish from 'components/auth/finish/Finish';

import authFlow from 'services/authFlow';

export default function routesFactory(store) {
    authFlow.setStore(store);

    const startAuthFlow = {
        onEnter: ({location}, replace, callback) => authFlow.handleRequest(location.pathname, replace, callback)
    };

    const userOnly = {
        onEnter: (nextState, replace) => {
            const {user} = store.getState();

            if (user.isGuest) {
                replace('/');
            }
        }
    };

    return (
        <Route path="/" component={RootPage}>
            <IndexRoute component={IndexPage} {...startAuthFlow} />

            <Route path="rules" component={RulesPage} />

            <Route path="oauth2(/:version)" component={OAuthInit} {...startAuthFlow} />

            <Route path="auth" component={AuthPage}>
                <Route path="/login" components={new Login()} {...startAuthFlow} />
                <Route path="/password" components={new Password()} {...startAuthFlow} />
                <Route path="/register" components={new Register()} {...startAuthFlow} />
                <Route path="/activation(/:key)" components={new Activation()} {...startAuthFlow} />
                <Route path="/resend-activation" components={new ResendActivation()} {...startAuthFlow} />
                <Route path="/oauth/permissions" components={new Permissions()} {...startAuthFlow} />
                <Route path="/oauth/finish" component={Finish} {...startAuthFlow} />
                <Route path="/change-password" components={new ChangePassword()} {...startAuthFlow} />
                <Route path="/forgot-password" components={new ForgotPassword()} {...startAuthFlow} />
                <Route path="/recover-password(/:key)" components={new RecoverPassword()} {...startAuthFlow} />
            </Route>

            <Route path="profile" component={ProfilePage} {...userOnly}>
                <Route path="change-password" component={ProfileChangePasswordPage} />
                <Route path="change-username" component={ProfileChangeUsernamePage} />
                <Route path="change-email(/:step)(/:code)" component={ProfileChangeEmailPage} />
            </Route>

            <Route path="*" component={PageNotFound} />
        </Route>
    );
}
