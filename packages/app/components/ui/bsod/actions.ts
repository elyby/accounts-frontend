import { Action } from 'redux';

export const BSOD = 'BSOD';

export function bsod(): Action {
  return {
    type: BSOD,
  };
}
