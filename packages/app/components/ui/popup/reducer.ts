import React from 'react';
import { combineReducers } from 'redux';

import { Action } from './actions';

export interface PopupConfig {
  Popup: React.ElementType;
  props?: Record<string, any>;
  // Don't allow hiding popup
  disableOverlayClose?: boolean;
}

export type State = {
  popups: Array<PopupConfig>;
};

export default combineReducers<State>({
  popups,
});

function popups(state: Array<PopupConfig> = [], { type, payload }: Action) {
  switch (type) {
    case 'POPUP_CREATE':
      if (!payload.Popup) {
        throw new Error('Popup is required');
      }

      return state.concat(payload);
    case 'POPUP_DESTROY':
      return state.filter(popup => popup !== payload);
    default:
      return state;
  }
}
