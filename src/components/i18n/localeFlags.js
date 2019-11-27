// @flow
import supportedLocales from 'i18n/index.json';

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
const SUPPORTED_LANGUAGES: Array<string> = Object.keys(supportedLocales);

export default {
  getCountryList(): Array<string> {
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
