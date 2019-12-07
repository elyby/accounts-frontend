import React from 'react';
import { combineReducers } from 'redux';

import { POPUP_CREATE, POPUP_DESTROY } from './actions';

export interface PopupConfig {
  Popup: React.ElementType;
  props?: { [key: string]: any };
  // do not allow hiding popup
  disableOverlayClose?: boolean;
}

export type State = {
  popups: PopupConfig[];
};

export default combineReducers<State>({
  popups,
});

function popups(state: PopupConfig[] = [], { type, payload }) {
  switch (type) {
    case POPUP_CREATE:
      if (!payload.Popup) {
        throw new Error('Popup is required');
      }

      return state.concat(payload);

    case POPUP_DESTROY:
      return state.filter(popup => popup !== payload);

    default:
      return state;
  }
}
