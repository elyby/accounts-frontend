import 'app/polyfills';
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { factory as userFactory } from 'app/components/user/factory';
import authFlow from 'app/services/authFlow';
import storeFactory from 'app/storeFactory';
import bsodFactory from 'app/components/ui/bsod/factory';
import loader from 'app/services/loader';
import logger from 'app/services/logger';
import font from 'app/services/font';
import history, { browserHistory } from 'app/services/history';
import i18n from 'app/services/i18n';
import { loadScript, debounce } from 'app/functions';

import App from './App';

const win: { [key: string]: any } = window as any;

history.init();

logger.init({
  sentryCdn: (window as any).SENTRY_CDN as string,
});

const store = storeFactory();

bsodFactory(store, () => loader.hide());
authFlow.setStore(store);

Promise.all([
  userFactory(store),
  font.load(['Roboto', 'Roboto Condensed']),
  i18n.ensureIntl(), // ensure, that intl is polyfilled before any rendering
]).then(() => {
  ReactDOM.render(
    <App store={store} browserHistory={browserHistory} />,
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
    } = function(...args) {
      // eslint-disable-next-line id-length
      (ga.q = ga.q || []).push(args);
    };
    win.ga = ga;
    ga.l = Date.now(); // eslint-disable-line

    if (win.GA_ID) {
      // when GA is not available, we will continue to push into array
      // for debug purposes
      // Catch to prevent "unhandled rejection" error
      loadScript(
        'https://www.google-analytics.com/analytics.js',
      ).catch(() => {});
    }

    ga('create', win.GA_ID, 'auto');
    trackPageView(location);

    browserHistory.listen(trackPageView);
  }
}

function _trackPageView(location) {
  const { ga } = win;

  ga('set', 'page', location.pathname + location.search);
  ga('send', 'pageview');
}

/* global process: false */
if (process.env.NODE_ENV !== 'production') {
  // some shortcuts for testing on localhost
  win.testOAuth = (loginHint = '') =>
    (location.href = `/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&login_hint=${loginHint}`);
  win.testOAuthPermissions = () =>
    (location.href =
      '/oauth2/v1/tlauncher?client_id=tlauncher&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code&scope=account_info,account_email');
  win.testOAuthPromptAccount = () =>
    (location.href =
      '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=select_account');
  win.testOAuthPromptPermissions = (loginHint = '') =>
    (location.href = `/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=consent&login_hint=${loginHint}`);
  win.testOAuthPromptAll = () =>
    (location.href =
      '/oauth2/v1/ely?client_id=ely&redirect_uri=http%3A%2F%2Fely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email&prompt=select_account,consent');
  win.testOAuthStatic = () =>
    (location.href =
      '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page_with_code&response_type=code&scope=account_info%2Caccount_email');
  win.testOAuthStaticCode = () =>
    (location.href =
      '/oauth2/v1/ely?client_id=ely&redirect_uri=static_page&response_type=code&scope=account_info%2Caccount_email');
}
