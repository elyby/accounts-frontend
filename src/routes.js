import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RootPage from 'pages/root/RootPage';
import IndexPage from 'pages/index/IndexPage';
import SignInPage from 'pages/auth/SignInPage';

export default (
  <Route path="/" component={RootPage}>
    <IndexRoute component={IndexPage} />
    <Route path="/signin" component={SignInPage} />
  </Route>
);
