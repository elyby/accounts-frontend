import 'polyfills';

import expect from 'unexpected';
expect.use(require('unexpected-sinon'));

if (!window.localStorage) {
    window.localStorage = {
        getItem(key) {
            return this[key];
        },
        setItem(key, value) {
            this[key] = value;
        },
        removeItem(key) {
            delete this[key];
        }
    };

    window.sessionStorage = {
        ...window.localStorage
    };
}

// require all modules ending in "_test" from the
// current directory and all subdirectories
const testsContext = require.context('.', true, /\.test\.jsx?$/);
testsContext.keys().forEach(testsContext);
