import { BSOD } from './actions';

export type State = boolean;

export default function(state: State = false, { type }): State {
  if (type === BSOD) {
    return true;
  }

  return state;
}
