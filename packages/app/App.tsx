import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider as ReduxProvider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { IntlProvider } from 'app/components/i18n';
import { Store } from 'redux';
import AuthFlowRoute from 'app/containers/AuthFlowRoute';
import RootPage from 'app/pages/root/RootPage';
import SuccessOauthPage from 'app/pages/auth/SuccessOauthPage';

const App = ({
  store,
  browserHistory,
}: {
  store: Store;
  browserHistory: any;
}) => (
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
