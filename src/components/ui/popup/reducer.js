import { combineReducers } from 'redux';

import { POPUP_CREATE, POPUP_DESTROY } from './actions';

export default combineReducers({
    popups
});

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
