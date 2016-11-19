import 'polyfills';

import React from 'react';
import ReactDOM from 'react-dom';

import { Provider as ReduxProvider } from 'react-redux';
import { Router, browserHistory } from 'react-router';

import webFont from 'webfontloader';

import { factory as userFactory } from 'components/user/factory';
import { IntlProvider } from 'components/i18n';
import routesFactory from 'routes';
import storeFactory from 'storeFactory';
import bsodFactory from 'components/ui/bsod/factory';
import loader from 'services/loader';

const store = storeFactory();

bsodFactory(store, stopLoading);

const fontLoadingPromise = new Promise((resolve) =>
    webFont.load({
        classes: false,
        active: resolve,
        inactive: resolve, // TODO: may be we should track such cases
        timeout: 2000,
        custom: {
            families: ['Roboto', 'Roboto Condensed']
        }
    })
);

Promise.all([
    userFactory(store),
    fontLoadingPromise
])
.then(() => {
    ReactDOM.render(
        <ReduxProvider store={store}>
            <IntlProvider>
                <Router history={browserHistory} onUpdate={() => {
                    restoreScroll();
                    stopLoading();
                }}>
                    {routesFactory(store)}
                </Router>
            </IntlProvider>
        </ReduxProvider>,
        document.getElementById('app')
    );
});


function stopLoading() {
    loader.hide();
}

import scrollTo from 'components/ui/scrollTo';
const SCROLL_ANCHOR_OFFSET = 80; // 50 + 30 (header height + some spacing)
/**
 * Scrolls to page's top or #anchor link, if any
 */
function restoreScroll() {
    const {hash} = location;

    // Push onto callback queue so it runs after the DOM is updated
    setTimeout(() => {
        const id = hash.replace('#', '');
        const el = id ? document.getElementById(id) : null;
        const viewPort = document.getElementById('view-port');

        if (!viewPort) {
            console.log('Can not find viewPort element');
            return;
        }

        let y = 0;
        if (el) {
            const {scrollTop} = viewPort;
            const {top} = el.getBoundingClientRect();

            y = scrollTop + top - SCROLL_ANCHOR_OFFSET;
        }

        scrollTo(y, viewPort);
    }, 200);
}

/* global process: false */
if (process.env.NODE_ENV !== 'production') {
    // some shortcuts for testing on localhost
    window.testOAuth = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email';
    window.testOAuthStatic = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page_with_code&response_type=code&scope=account_info%2Caccount_email';
    window.testOAuthStaticCode = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page&response_type=code&scope=account_info%2Caccount_email';

    // expose Perf
    window.Perf = require('react-addons-perf');
}
