import supportedLocales from 'app/i18n';

const localeToCountryCode: Record<string, string> = {
    en: 'gb',
    be: 'by',
    pt: 'br',
    uk: 'ua',
    vi: 'vn',
    sl: 'si',
    sr: 'rs',
    zh: 'cn',
    cs: 'cz',
};
const SUPPORTED_LANGUAGES: string[] = Object.keys(supportedLocales);

export default {
    getCountryList(): string[] {
        return SUPPORTED_LANGUAGES.map((locale) => localeToCountryCode[locale] || locale);
    },

    /**
     * Возвращает для указанной локали её флаг с учётом всех нюансов загрузки флага
     * и подбора соответствующего локали флага.
     *
     * @param {string} locale
     *
     * @returns {string}
     */
    getIconUrl(locale: string): string {
        let mod;

        try {
            mod = require(`./flags/${locale}.svg`);
        } catch (err1) {
            if (!err1.message.startsWith('Cannot find module')) {
                throw err1;
            }

            try {
                mod = require(`flag-icon-css/flags/4x3/${localeToCountryCode[locale] || locale}.svg`);
            } catch (err2) {
                if (!err2.message.startsWith('Cannot find module')) {
                    throw err2;
                }

                mod = require('./flags/unknown.svg');
            }
        }

        return mod.default || mod;
    },
};
