import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import ruLocaleData from 'react-intl/locale-data/ru';

const SUPPORTED_LANGUAGES = ['ru', 'en'];
const DEFAULT_LANGUAGE = 'en';
function getUserLanguages(userSelectedLang = []) {
    return [].concat(userSelectedLang || [])
        .concat(navigator.languages || [])
        .concat(navigator.language || []);
}

function detectLanguage(userLanguages, availableLanguages, defaultLanguage) {
    return (userLanguages || [])
        .concat(defaultLanguage)
        .map((lang) => lang.split('-').shift().toLowerCase())
        .find((lang) => availableLanguages.indexOf(lang) !== -1);
}

export default {
    detectLanguage(lang) {
        return detectLanguage(getUserLanguages(lang), SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE);
    },

    require(locale) {
        // till we have not so many locales, we can require their data at once
        addLocaleData(enLocaleData);
        addLocaleData(ruLocaleData);

        return new Promise(require(`bundle!i18n/${locale}.json`))
            .then((messages) => ({locale, messages}));
    }
};