// @flow
import i18n from 'services/i18n';

import { SET_LOCALE } from './actions';

type State = { locale: string };

const defaultState = {
  locale: i18n.detectLanguage(),
};

export default function(
  state: State = defaultState,
  { type, payload }: { type: string, payload: State },
): State {
  if (type === SET_LOCALE) {
    return payload;
  }

  return state;
}
