import 'babel-polyfill';
import 'promise.prototype.finally';

// allow :active styles in mobile Safary
document.addEventListener('touchstart', () => {}, true);
