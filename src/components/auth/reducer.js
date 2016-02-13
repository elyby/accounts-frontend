import { combineReducers } from 'redux';

import { ERROR } from './actions';

export default combineReducers({
    error
});

function error(
    state = null,
    {type, payload = null, error = false}
) {
    switch (type) {
        case ERROR:
            if (!error) {
                throw new Error('Expected payload with error');
            }
            return payload;

        default:
            return state;
    }
}
