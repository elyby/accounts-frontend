import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { History } from 'history';
import { Store } from 'app/reducers';
import AuthFlowRoute from 'app/containers/AuthFlowRoute';
import RootPage from 'app/pages/root/RootPage';
import { ComponentLoader } from 'app/components/ui/loader';

import ContextProvider from './ContextProvider';

const SuccessOauthPage = React.lazy(() =>
    import(/* webpackChunkName: "page-oauth-success" */ 'app/pages/auth/SuccessOauthPage'),
);

const App = ({ store, history }: { store: Store; history: History<any> }) => (
    <ContextProvider store={store} history={history}>
        <React.Suspense fallback={<ComponentLoader />}>
            <Switch>
                <Route path="/oauth2/code/success" component={SuccessOauthPage} />
                <AuthFlowRoute path="/oauth2/:version(v\d+)/:clientId?" component={() => null} />
                <Route path="/" component={RootPage} />
            </Switch>
        </React.Suspense>
    </ContextProvider>
);

export default hot(App);
