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
import { loadFonts } from 'app/services/fonts';
import history, { browserHistory } from 'app/services/history';
import i18n from 'app/services/i18n';
import { loadScript, debounce } from 'app/functions';
import { Location as HistoryLocation } from 'history';

import App from './shell/App';

const win: { [key: string]: any } = window as any;

history.init();

logger.init({
    sentryDSN: (window as any).SENTRY_DSN as string,
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

    initAnalytics();
});

const trackPageView = debounce(_trackPageView);
function initAnalytics() {
    if (!win.ga) {
        const ga: {
            [key: string]: any;
            (...args: any[]): void;
        } = function (...args) {
            // eslint-disable-next-line id-length
            (ga.q = ga.q || []).push(args);
        };
        win.ga = ga;
        ga.l = Date.now(); // eslint-disable-line

        if (win.GA_ID) {
            // when GA is not available, we will continue to push into array
            // for debug purposes
            // Catch to prevent "unhandled rejection" error
            loadScript('https://www.google-analytics.com/analytics.js').catch(() => {});
        }

        ga('create', win.GA_ID, 'auto');
        trackPageView(location);

        browserHistory.listen(trackPageView);
    }
}

function _trackPageView(location: HistoryLocation | Location): void {
    const { ga } = win;

    ga('set', 'page', location.pathname + location.search);
    ga('send', 'pageview');
}
