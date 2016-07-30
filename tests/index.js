import 'polyfills';

import expect from 'unexpected';
expect.use(require('unexpected-sinon'));

// require all modules ending in "_test" from the
// current directory and all subdirectories
const testsContext = require.context('.', true, /\.test\.jsx?$/);
testsContext.keys().forEach(testsContext);
