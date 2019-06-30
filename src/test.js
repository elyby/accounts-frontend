import 'polyfills';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

if (!window.localStorage) {
    window.localStorage = {
        getItem(key) {
            return this[key] || null;
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

// require all modules ending in ".test.js" from the
// current directory and all subdirectories
const testsContext = require.context('.', true, /\.test\.jsx?$/);
testsContext.keys().forEach(testsContext);
