// @flow
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider as ReduxProvider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { IntlProvider } from 'components/i18n';
import AuthFlowRoute from 'containers/AuthFlowRoute';
import RootPage from 'pages/root/RootPage';
import SuccessOauthPage from 'pages/auth/SuccessOauthPage';

const App = ({ store, browserHistory }) => (
  <ReduxProvider store={store}>
    <IntlProvider>
      <Router history={browserHistory}>
        <Switch>
          <Route path="/oauth2/code/success" component={SuccessOauthPage} />
          <AuthFlowRoute
            path="/oauth2/:version(v\d+)/:clientId?"
            component={() => null}
          />
          <Route path="/" component={RootPage} />
        </Switch>
      </Router>
    </IntlProvider>
  </ReduxProvider>
);

export default hot(App);
