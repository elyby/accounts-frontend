import 'app/polyfills';
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from '@sentry/react';
import { factory as userFactory } from 'app/components/user/factory';
import authFlow from 'app/services/authFlow';
import storeFactory from 'app/storeFactory';
import bsodFactory from 'app/components/ui/bsod/factory';
import dispatchBsod from 'app/components/ui/bsod/dispatchBsod';
import getOAuthDebugContext from 'app/components/auth/oauthDebugContext';
import * as loader from 'app/services/loader';
import logger from 'app/services/logger';
import { parseSampleRate } from 'app/services/request/tracing';
import { loadFonts } from 'app/services/fonts';
import history, { browserHistory } from 'app/services/history';
import i18n from 'app/services/i18n';

import App from './shell/App';

history.init();

logger.init({
    sentryDSN: (window as any).SENTRY_DSN as string,
    tracesSampleRate: parseSampleRate((window as any).SENTRY_TRACES_SAMPLE_RATE),
    history: browserHistory,
});

const store = storeFactory();

logger.addContextProvider('oauth', () => getOAuthDebugContext(store.getState()));

bsodFactory({
    store,
    history: browserHistory,
    stopLoading: () => loader.hide(),
});
authFlow.setStore(store);

Promise.all([
    userFactory(store),
    loadFonts(),
    i18n.ensureIntl(), // ensure, that intl is polyfilled before any rendering
]).then(() => {
    ReactDOM.render(
        // Call dispatchBsod() with timeout, so an error inside dispatch wouldn't break ErrorBoundary itself
        <ErrorBoundary onError={() => setTimeout(() => dispatchBsod())}>
            <App store={store} history={browserHistory} />
        </ErrorBoundary>,
        document.getElementById('app'),
    );
});
