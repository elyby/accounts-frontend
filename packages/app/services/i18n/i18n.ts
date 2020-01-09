import { IntlShape, createIntl, createIntlCache } from 'react-intl';
import captcha from 'app/services/captcha';
import locales from 'app/i18n';

import intlPolyfill from './intlPolyfill';

const SUPPORTED_LANGUAGES = Object.keys(locales);
const DEFAULT_LANGUAGE = 'en';

function getBrowserPreferredLanguages(): string[] {
  return []
    .concat(
      // @ts-ignore
      navigator.languages || [],
    )
    .concat(navigator.language || []);
}

function detectLanguage(
  userLanguages: string[],
  availableLanguages: string[],
  defaultLanguage: string,
): string {
  return (
    userLanguages
      .map(lang => (lang.split('-').shift() || '').toLowerCase())
      .find(lang => availableLanguages.indexOf(lang) !== -1) || defaultLanguage
  );
}

const cache = createIntlCache();

let intl: IntlShape;

class I18N {
  detectLanguage(lang: string = ''): string {
    return detectLanguage(
      [lang].concat(getBrowserPreferredLanguages()).filter(item => !!item),
      SUPPORTED_LANGUAGES,
      DEFAULT_LANGUAGE,
    );
  }

  getIntl(): IntlShape {
    if (!intl) {
      intl = createIntl(
        {
          locale: 'en',
          messages: {},
        },
        cache,
      );
    }

    return intl;
  }

  async changeLocale(locale: string = DEFAULT_LANGUAGE): Promise<IntlShape> {
    const { messages } = await this.require(locale);

    captcha.setLang(locale);

    intl = createIntl(
      {
        locale,
        messages,
      },
      cache,
    );

    return intl;
  }

  async ensureIntl() {
    await intlPolyfill('en');
  }

  async require(
    locale: string,
  ): Promise<{
    locale: string;
    messages: { [key: string]: string };
  }> {
    const [{ default: messages }] = await Promise.all([
      import(
        /* webpackChunkName: "locale-[request]" */ `app/i18n/${locale}.json`
      ),
      intlPolyfill(locale),
    ]);

    return {
      locale,
      messages,
    };
  }
}

export default new I18N();
