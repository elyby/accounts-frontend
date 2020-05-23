import { Action as ReduxPopup } from 'redux';
import { PopupConfig } from './reducer';

interface PopupCreateAction extends ReduxPopup {
  type: 'POPUP_CREATE';
  payload: PopupConfig;
}

export function create(popup: PopupConfig): PopupCreateAction {
  return {
    type: 'POPUP_CREATE',
    payload: popup,
  };
}

interface PopupDestroyAction extends ReduxPopup {
  type: 'POPUP_DESTROY';
  payload: PopupConfig;
}

export function destroy(popup: PopupConfig): PopupDestroyAction {
  return {
    type: 'POPUP_DESTROY',
    payload: popup,
  };
}

export type Action = PopupCreateAction | PopupDestroyAction;
