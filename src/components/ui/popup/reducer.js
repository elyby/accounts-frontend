import { combineReducers } from 'redux';

import { POPUP_REGISTER, POPUP_CREATE, POPUP_DESTROY } from './actions';

export default combineReducers({
    pool,
    popups
});

function pool(pool = {}, {type, payload}) {
    if (type === POPUP_REGISTER) {
        if (!payload.type || !payload.component) {
            throw new Error('Type and component are required');
        }

        return {
            ...pool,
            [payload.type]: payload.component
        };
    }

    return pool;
}

function popups(popups = [], {type, payload}) {
    switch (type) {
        case POPUP_CREATE:
            if (!payload.type) {
                throw new Error('Popup type is required');
            }

            return popups.concat(payload);

        case POPUP_DESTROY:
            if (!payload.type) {
                throw new Error('Popup type is required');
            }

            return popups.filter((popup) => popup !== payload);

        default:
            return popups;
    }
}
