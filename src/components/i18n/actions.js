import i18n from 'services/i18n';

export const SET_LOCALE = 'SET_LOCALE';
export function setLocale(locale) {
    return (dispatch) => i18n.require(
        i18n.detectLanguage(locale)
    ).then(({locale, messages}) => {
        dispatch({
            type: SET_LOCALE,
            payload: {
                locale,
                messages
            }
        });

        return locale;
    });
}
