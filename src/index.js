import 'polyfills';
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { factory as userFactory } from 'components/user/factory';
import authFlow from 'services/authFlow';
import storeFactory from 'storeFactory';
import bsodFactory from 'components/ui/bsod/factory';
import loader from 'services/loader';
import logger from 'services/logger';
import font from 'services/font';
import history, { browserHistory } from 'services/history';
import { loadScript, debounce } from 'functions';

import App from './App';

history.init();

logger.init({
    sentryCdn: window.SENTRY_CDN
});

const store = storeFactory();

bsodFactory(store, () => loader.hide());
authFlow.setStore(store);

Promise.all([
    userFactory(store),
    font.load(['Roboto', 'Roboto Condensed'])
]).then(() => {
    ReactDOM.render(
        <App store={store} browserHistory={browserHistory} />,
        document.getElementById('app')
    );

    initAnalytics();
});

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
            // Catch to prevent "unhandled rejection" error
            loadScript('https://www.google-analytics.com/analytics.js').catch(() => {});
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
    window.testOAuthPermissions = () => location.href = '/oauth2/v1/tlauncher?client_id=tlauncher&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code&scope=account_info,account_email';
    window.testOAuthPromptAccount = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=select_account';
    window.testOAuthPromptPermissions = (loginHint = '') => location.href = `/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=consent&login_hint=${loginHint}`;
    window.testOAuthPromptAll = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=select_account,consent';
    window.testOAuthStatic = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page_with_code&response_type=code&scope=account_info%2Caccount_email';
    window.testOAuthStaticCode = () => location.href = '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page&response_type=code&scope=account_info%2Caccount_email';
}
