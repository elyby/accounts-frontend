import { combineReducers } from 'redux';

import { ERROR, SET_CLIENT } from './actions';

export default combineReducers({
    error,
    client
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

function client(
    state = null,
    {type, payload = {}}
) {
    switch (type) {
        case SET_CLIENT:
            return {
                id: payload.id,
                name: payload.name,
                description: payload.description
            };

        default:
            return state;
    }
}
