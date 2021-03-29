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
    fil: 'ph',
    he: 'il',
};
const SUPPORTED_LANGUAGES: ReadonlyArray<string> = Object.keys(supportedLocales);

export function getCountriesList(): string[] {
    return SUPPORTED_LANGUAGES.map((locale) => localeToCountryCode[locale] || locale);
}

/**
 * Возвращает для указанной локали её флаг с учётом всех нюансов загрузки флага
 * и подбора соответствующего локали флага.
 *
 * @param {string} locale
 *
 * @returns {string}
 */
export function getLocaleIconUrl(locale: string): string {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(`flag-icon-css/flags/4x3/${localeToCountryCode[locale] || locale}.svg`).default;
    } catch (err) {
        if (!err.message.startsWith('Cannot find module')) {
            throw err;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./flags/unknown.svg').default;
}
