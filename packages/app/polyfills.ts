import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
import { shim as shimPromiseFinally } from 'promise.prototype.finally';
import { polyfill as rafPolyfill } from 'raf';

rafPolyfill();
shimPromiseFinally();

// allow :active styles in mobile Safary
document.addEventListener('touchstart', () => {}, true);

// disable mobile safary back-forward cache
// http://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
window.onpageshow = (event: PageTransitionEvent) => {
    event.persisted && window.location.reload();
};
