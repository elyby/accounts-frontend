import 'babel-polyfill';
import 'whatwg-fetch';
import { shim as shimPromiseFinaly } from 'promise.prototype.finally';

shimPromiseFinaly();

// allow :active styles in mobile Safary
document.addEventListener('touchstart', () => {}, true);

// disable mobile safary back-forward cache
// http://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
window.onpageshow = (event) => {
    event.persisted && window.location.reload();
};
