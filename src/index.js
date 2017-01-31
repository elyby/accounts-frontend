import 'polyfills';

import React from 'react';
import ReactDOM from 'react-dom';

import { Provider as ReduxProvider } from 'react-redux';
import { Router, browserHistory } from 'react-router';

import { factory as userFactory } from 'components/user/factory';
import { IntlProvider } from 'components/i18n';
import routesFactory from 'routes';
import storeFactory from 'storeFactory';
import bsodFactory from 'components/ui/bsod/factory';
import loader from 'services/loader';
import logger from 'services/logger';
import font from 'services/font';
import history from 'services/history';

history.init();

logger.init({
    sentryCdn: window.SENTRY_CDN
});

const store = storeFactory();

bsodFactory(store, stopLoading);

Promise.all([
    userFactory(store),
    font.load(['Roboto', 'Roboto Condensed'])
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

    initAnalytics();
});


function stopLoading() {
    loader.hide();
}

import { scrollTo } from 'components/ui/scrollTo';
import { getScrollTop } from 'functions';
const SCROLL_ANCHOR_OFFSET = 80; // 50 + 30 (header height + some spacing)
// Первый скролл выполняется сразу после загрузки страницы, так что чтобы снизить
// нагрузку на рендеринг мы откладываем первый скрол на 200ms
let isFirstScroll = true;
/**
 * Scrolls to page's top or #anchor link, if any
 */
function restoreScroll() {
    const {hash} = location;

    setTimeout(() => {
        isFirstScroll = false;
        const id = hash.replace('#', '');
        const el = id ? document.getElementById(id) : null;
        const viewPort = document.body;

        if (!viewPort) {
            console.log('Can not find viewPort element'); // eslint-disable-line
            return;
        }

        let y = 0;
        if (el) {
            const {top} = el.getBoundingClientRect();

            y = getScrollTop() + top - SCROLL_ANCHOR_OFFSET;
        }

        scrollTo(y, viewPort);
    }, isFirstScroll ? 200 : 0);
}

import { loadScript, debounce } from 'functions';
const trackPageView = debounce(_trackPageView);
function initAnalytics() {
    if (!window.ga) {
        const ga = window.ga = function() {
            (ga.q = ga.q || []).push(arguments); // eslint-disable-line
        };
        ga.l = Date.now(); // eslint-disable-line

        if (window.GA_ID) {
            // when GA is not available, we will continue to push into array
            // for debug purposes
            loadScript('https://www.google-analytics.com/analytics.js');
        }

        ga('create', window.GA_ID, 'auto');
        trackPageView(location);

        browserHistory.listen(trackPageView);
    }
}

function _trackPageView(location) {
    const ga = window.ga;

    ga('set', 'page', location.pathname + location.search);
    ga('send', 'pageview');
}

/* global process: false */
if (process.env.NODE_ENV !== 'production') {
    // some shortcuts for testing on localhost
    window.testOAuth = (loginHint = '') => location.href = `/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&login_hint=${loginHint}`;
    window.testOAuthPromptAccount = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=select_account';
    window.testOAuthPromptPermissions = (loginHint = '') => location.href = `/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=consent&login_hint=${loginHint}`;
    window.testOAuthPromptAll = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=select_account,consent';
    window.testOAuthStatic = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page_with_code&response_type=code&scope=account_info%2Caccount_email';
    window.testOAuthStaticCode = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page&response_type=code&scope=account_info%2Caccount_email';

    // expose Perf
    window.Perf = require('react-addons-perf');
}
