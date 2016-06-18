import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import ruLocaleData from 'react-intl/locale-data/ru';
import beLocaleData from 'react-intl/locale-data/be';
import ukLocaleData from 'react-intl/locale-data/uk';

// till we have not so many locales, we can require their data at once
addLocaleData(enLocaleData);
addLocaleData(ruLocaleData);
addLocaleData(beLocaleData);
addLocaleData(ukLocaleData);

const SUPPORTED_LANGUAGES = ['ru', 'en', 'be', 'uk'];
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
            new Promise(require(`bundle?name=[name]!i18n/${locale}.json`))
        ];

        if (needPolyfill) {
            promises.push(new Promise((resolve) => {
                require.ensure([], () => {
                    require('intl');
                    require.context(
                        'bundle?name=[name]-polyfill-data!intl/locale-data/jsonp',
                        false,
                        /\.\/(en|ru|be|uk)\.js$/
                    )(`./${locale}.js`)(resolve);
                });
            }));
        }

        return Promise.all(promises)
            .then(([messages]) => ({locale, messages}));
    }
};
