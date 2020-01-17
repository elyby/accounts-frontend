import { Action } from './actions';

export type State = boolean;

export default function(state: State = false, { type }: Action): State {
  if (type === 'BSOD') {
    return true;
  }

  return state;
}
