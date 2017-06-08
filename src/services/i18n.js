import locales from 'i18n/index.json';

import { addLocaleData } from 'react-intl';

const SUPPORTED_LANGUAGES = Object.keys(locales);
const DEFAULT_LANGUAGE = 'en';

const needPolyfill = !window.Intl;

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
        const promises = [
            new Promise(require(`bundle?name=[name]!react-intl/locale-data/${locale}.js`)),
            new Promise(require(`bundle?name=[name]!i18n/${locale}.json`))
        ];

        if (needPolyfill) {
            promises.push(
                new Promise(require('bundle?name=intl!intl')),
            );
            promises.push(
                new Promise(require(`bundle?name=[name]-polyfill-data!intl/locale-data/jsonp/${locale}.js`)),
            );
        }

        return Promise.all(promises)
            .then(([localeData, messages]) => {
                addLocaleData(localeData);

                return {locale, messages};
            });
    }
};
