import i18n from 'services/i18n';
import captcha from 'services/captcha';

export const SET_LOCALE = 'i18n:setLocale';
export function setLocale(locale) {
    return (dispatch) => i18n.require(
        i18n.detectLanguage(locale)
    ).then(({locale, messages}) => {
        dispatch(_setLocale({locale, messages}));

        // TODO: probably should be moved from here, because it is a side effect
        captcha.setLang(locale);

        return locale;
    });
}

function _setLocale({locale, messages}) {
    return {
        type: SET_LOCALE,
        payload: {
            locale,
            messages
        }
    };
}
