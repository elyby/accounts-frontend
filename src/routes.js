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

function requireAuth(nextState, replace) {
    // if (!auth.loggedIn()) {
        replace({
            pathname: '/login',
            state: {
                nextPathname: nextState.location.pathname
            }
        });
    // }
}

export default (
  <Route path="/" component={RootPage}>
    <IndexRoute component={IndexPage} onEnter={requireAuth} />

    <Route path="auth" component={AuthPage}>
        <Route path="/login" component={Login} />
        <Route path="/password" component={Password} />
        <Route path="/register" component={Register} />
        <Route path="/activation" component={Activation} />
        <Route path="/oauth/permissions" component={Permissions} />
        <Route path="/oauth/:id" component={Permissions} />
    </Route>
  </Route>
);
