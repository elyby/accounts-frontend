import 'polyfills';

import React from 'react';
import ReactDOM from 'react-dom';

import { Provider as ReduxProvider } from 'react-redux';
import { Router, browserHistory } from 'react-router';

import { factory as userFactory } from 'components/user/factory';
import { IntlProvider } from 'components/i18n';
import routesFactory from 'routes';
import storeFactory from 'storeFactory';

const store = storeFactory();

userFactory(store)
.then(() => {
    // allow :active styles in mobile Safary
    document.addEventListener('touchstart', () => {}, true);

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
            throw new Error('Can not find viewPort element');
        }

        let y = 0;
        if (el) {
            const {scrollTop} = viewPort;
            const {top} = el.getBoundingClientRect();

            y = scrollTop + top - SCROLL_ANCHOR_OFFSET;
        }

        scrollTo(y, viewPort);
    }, 100);
}

function stopLoading() {
    document.getElementById('loader').classList.remove('is-active');
}

/* global process: false */
if (process.env.NODE_ENV !== 'production') {
    // some shortcuts for testing on localhost
    window.testOAuth = () => location.href = '/oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session';
    window.testOAuthStatic = () => location.href = '/oauth?client_id=ely&redirect_uri=static_page_with_code&response_type=code&scope=minecraft_server_session';
    window.testOAuthStaticCode = () => location.href = '/oauth?client_id=ely&redirect_uri=static_page&response_type=code&scope=minecraft_server_session';
}
