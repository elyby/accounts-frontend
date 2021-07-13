import { IntlShape, createIntl, createIntlCache } from 'react-intl';
import captcha from 'app/services/captcha';
import locales from 'app/i18n';

import intlPolyfill from './intlPolyfill';

export const SUPPORTED_LANGUAGES = Object.keys(locales);
export const DEFAULT_LANGUAGE = 'en';

function getBrowserPreferredLanguages(): string[] {
    return ([] as string[]).concat(navigator['languages'] || []).concat(navigator['language'] || []);
}

function detectLanguage(userLanguages: string[], availableLanguages: string[], defaultLanguage: string): string {
    return (
        userLanguages
            .map((lang) => (lang.split('-').shift() || '').toLowerCase())
            .find((lang) => availableLanguages.indexOf(lang) !== -1) || defaultLanguage
    );
}

const cache = createIntlCache();

let intl: IntlShape;

class I18N {
    detectLanguage(lang: string = ''): string {
        return detectLanguage(
            [lang].concat(getBrowserPreferredLanguages()).filter((item) => !!item),
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

    async require(locale: string): Promise<{
        locale: string;
        messages: Record<string, string>;
    }> {
        try {
            const [{ default: messages }] = await Promise.all([
                import(/* webpackChunkName: "locale-[request]" */ `app/i18n/${locale}.json`),
                intlPolyfill(locale),
            ]);

            return {
                locale,
                messages,
            };
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                if (err.message === "Cannot find module './en.json'") {
                    console.warn(
                        [
                            "Locales module for the source language isn't exists.",
                            'You may generate this file by running yarn i18n:extract command.',
                            'Until then, defaultMessages will be used for displaying on the site.',
                        ].join(' '),
                    );
                } else {
                    console.error(err);
                }

                return { locale, messages: {} };
            }

            throw err;
        }
    }
}

export default new I18N();
