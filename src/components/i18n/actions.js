// @flow
import i18n from 'services/i18n';

export const SET_LOCALE = 'i18n:setLocale';
export function setLocale(desiredLocale: string) {
  return async (dispatch: (action: Object) => any): Promise<string> => {
    const locale = i18n.detectLanguage(desiredLocale);

    dispatch(_setLocale(locale));

    return locale;
  };
}

function _setLocale(locale: string) {
  return {
    type: SET_LOCALE,
    payload: {
      locale,
    },
  };
}
