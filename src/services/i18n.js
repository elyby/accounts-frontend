// @flow
import locales from 'i18n/index.json';

import { addLocaleData } from 'react-intl';

const SUPPORTED_LANGUAGES = Object.keys(locales);
const DEFAULT_LANGUAGE = 'en';

const needPolyfill = !window.Intl;

function getUserLanguages(userSelectedLang: string): Array<string> {
    return [userSelectedLang]
        .concat(navigator.languages || [])
        .concat(navigator.language || []);
}

function detectLanguage(
    userLanguages: Array<string>,
    availableLanguages: Array<string>,
    defaultLanguage: string,
): string {
    return userLanguages
        .map((lang) => lang.split('-').shift().toLowerCase())
        .find((lang) => availableLanguages.indexOf(lang) !== -1) || defaultLanguage;
}

export default {
    detectLanguage(lang: string): string {
        return detectLanguage(getUserLanguages(lang), SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE);
    },

    require(locale: string): Promise<{
        locale: string;
        messages: { [string]: string };
    }> {
        const promises: Array<Promise<*>> = [
            new Promise(require(`bundle?name=[name]!react-intl/locale-data/${locale}.js`)),
            new Promise(require(`bundle?name=[name]!i18n/${locale}.json`))
        ];

        if (needPolyfill) {
            // $FlowFixMe
            promises.push(new Promise(require('bundle?name=intl!intl')));
            promises.push(new Promise(require(`bundle?name=[name]-polyfill-data!intl/locale-data/jsonp/${locale}.js`)));
        }

        return Promise.all(promises)
            .then(([localeData, messages]) => {
                addLocaleData(localeData);

                return {locale, messages};
            });
    }
};
