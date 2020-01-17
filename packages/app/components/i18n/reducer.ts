import i18n from 'app/services/i18n';

import { Action } from './actions';

export interface State {
  locale: string;
}

const defaultState: State = {
  locale: i18n.detectLanguage(),
};

export default function(
  state: State = defaultState,
  { type, payload }: Action,
): State {
  if (type === 'i18n:setLocale') {
    return payload;
  }

  return state;
}
