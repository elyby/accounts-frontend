import React, { ComponentType } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { History } from 'history';

import { IntlProvider } from 'app/components/i18n';
import { Store } from 'app/types';

interface Props {
    children: React.ReactNode;
    store: Store;
    history: History;
}

const ContextProvider: ComponentType<Props> = ({ children, store, history }) => (
    <HelmetProvider>
        <ReduxProvider store={store}>
            <IntlProvider>
                <Router history={history}>{children}</Router>
            </IntlProvider>
        </ReduxProvider>
    </HelmetProvider>
);

export default ContextProvider;
