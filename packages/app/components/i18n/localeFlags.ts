import supportedLocales from 'app/i18n';

const localeToCountryCode = {
  en: 'gb',
  be: 'by',
  pt: 'br',
  uk: 'ua',
  vi: 'vn',
  sl: 'si',
  sr: 'rs',
  zh: 'cn',
};
const SUPPORTED_LANGUAGES: string[] = Object.keys(supportedLocales);

export default {
  getCountryList(): string[] {
    return SUPPORTED_LANGUAGES.map(
      locale => localeToCountryCode[locale] || locale,
    );
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
    return require(`flag-icon-css/flags/4x3/${localeToCountryCode[locale] ||
      locale}.svg`);
  },
};
