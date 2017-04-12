import 'babel-polyfill';
import { shim as shimPromiseFinaly } from 'promise.prototype.finally';

const isEdge = /Edge\//.test(navigator.userAgent);
if (isEdge) {
    // Edge has a broken fetch implementation, so forcing the polyfill
    // https://www.reddit.com/r/webdev/comments/57ii4f/psa_edge_14_ships_a_broken_windowfetch/
    // https://github.com/aurelia/fetch-client/issues/81
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9370062/
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7773267/
    Reflect.deleteProperty(window, 'fetch');
}

// using require instead of import, because import is hoisting to the top
// so that our fetch hack for Edge won't work
require('whatwg-fetch');

shimPromiseFinaly();

// allow :active styles in mobile Safary
document.addEventListener('touchstart', () => {}, true);

// disable mobile safary back-forward cache
// http://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
window.onpageshow = (event) => {
    event.persisted && window.location.reload();
};
