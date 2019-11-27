import { combineReducers } from 'redux';

import { POPUP_CREATE, POPUP_DESTROY } from './actions';

export default combineReducers({
  popups,
});

function popups(popups = [], { type, payload = {} }) {
  switch (type) {
    case POPUP_CREATE:
      if (!payload.Popup) {
        throw new Error('Popup is required');
      }

      return popups.concat(payload);

    case POPUP_DESTROY:
      return popups.filter(popup => popup !== payload);

    default:
      return popups;
  }
}
