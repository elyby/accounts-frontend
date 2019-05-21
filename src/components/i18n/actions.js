// @flow
import i18n from 'services/i18n';
import captcha from 'services/captcha';

export const SET_LOCALE = 'i18n:setLocale';
export function setLocale(desiredLocale: string) {
    return async (dispatch: (action: Object) => any) => {
        const { locale, messages } = await i18n.require(i18n.detectLanguage(desiredLocale));
        dispatch(_setLocale(locale, messages));

        // TODO: probably should be moved from here, because it is a side effect
        captcha.setLang(locale);

        return locale;
    };
}

function _setLocale(locale: string, messages: { [string]: string }) {
    return {
        type: SET_LOCALE,
        payload: {
            locale,
            messages,
        },
    };
}
