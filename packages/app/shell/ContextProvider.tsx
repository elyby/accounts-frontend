import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Router } from 'react-router-dom';
import { IntlProvider } from 'app/components/i18n';
import { Store } from 'app/reducers';

function ContextProvider({
  children,
  store,
  history,
}: {
  children: React.ReactNode;
  store: Store;
  history: any;
}) {
  return (
    <ReduxProvider store={store}>
      <IntlProvider>
        <Router history={history}>{children}</Router>
      </IntlProvider>
    </ReduxProvider>
  );
}

export default ContextProvider;
