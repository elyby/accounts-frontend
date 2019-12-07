import { PopupConfig } from './reducer';

export const POPUP_CREATE = 'POPUP_CREATE';
export function create(payload: PopupConfig) {
  return {
    type: POPUP_CREATE,
    payload,
  };
}

export const POPUP_DESTROY = 'POPUP_DESTROY';
export function destroy(popup: PopupConfig) {
  return {
    type: POPUP_DESTROY,
    payload: popup,
  };
}
