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
        const promises: Array<Promise<any>> = [
            import(/* webpackChunkName: "[request]-locale" */`react-intl/locale-data/${locale}.js`),
            import(/* webpackChunkName: "[request]-locale" */`i18n/${locale}.json`),
        ];

        if (needPolyfill) {
            promises.push(import(/* webpackChunkName: "[request]-intl-polyfill" */ 'intl'));
            promises.push(import(/* webpackChunkName: "[request]-intl-polyfill" */`intl/locale-data/jsonp/${locale}.js`));
        }

        return Promise.all(promises)
            .then(([localeData, messages]) => {
                addLocaleData(localeData);

                return {locale, messages};
            });
    }
};
