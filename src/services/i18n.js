import { addLocaleData } from 'react-intl';
import beLocaleData from 'react-intl/locale-data/be';
import enLocaleData from 'react-intl/locale-data/en';
import idLocaleData from 'react-intl/locale-data/id';
import plLocaleData from 'react-intl/locale-data/pl';
import roLocaleData from 'react-intl/locale-data/ro';
import ruLocaleData from 'react-intl/locale-data/ru';
import slLocaleData from 'react-intl/locale-data/sl';
import ptLocaleData from 'react-intl/locale-data/pt';
import ukLocaleData from 'react-intl/locale-data/uk';
import viLocaleData from 'react-intl/locale-data/vi';

// till we have not so many locales, we can require their data at once
addLocaleData(beLocaleData);
addLocaleData(enLocaleData);
addLocaleData(idLocaleData);
addLocaleData(plLocaleData);
addLocaleData(roLocaleData);
addLocaleData(ruLocaleData);
addLocaleData(slLocaleData);
addLocaleData(ptLocaleData);
addLocaleData(ukLocaleData);
addLocaleData(viLocaleData);

const SUPPORTED_LANGUAGES = ['be', 'en', 'id', 'pl', 'ro', 'ru', 'sl', 'pt', 'uk', 'vi'];
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
                        new RegExp(`\\./(${SUPPORTED_LANGUAGES.join('|')})\\.js$`)
                    )(`./${locale}.js`)(resolve);
                });
            }));
        }

        return Promise.all(promises)
            .then(([messages]) => ({locale, messages}));
    }
};
