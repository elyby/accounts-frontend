import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Route, Switch } from 'react-router-dom';
import { Store } from 'app/reducers';
import AuthFlowRoute from 'app/containers/AuthFlowRoute';
import RootPage from 'app/pages/root/RootPage';
import SuccessOauthPage from 'app/pages/auth/SuccessOauthPage';

import ContextProvider from './ContextProvider';

const App = ({ store, history }: { store: Store; history: any }) => (
  <ContextProvider store={store} history={history}>
    <Switch>
      <Route path="/oauth2/code/success" component={SuccessOauthPage} />
      <AuthFlowRoute
        path="/oauth2/:version(v\d+)/:clientId?"
        component={() => null}
      />
      <Route path="/" component={RootPage} />
    </Switch>
  </ContextProvider>
);

export default hot(App);
