import logger from 'app/services/logger';

const needs = {
    intl: !window.Intl,
    plural: !window?.Intl?.PluralRules,
    // @ts-ignore ts has a little bit outdated definitions
    relative: !window?.Intl?.RelativeTimeFormat,
};

type ImportFunction = (l: string, m: string) => Promise<any>;

// WARNING: .js extension is required for proper function of ContextReplacementPlugin
// Thoroughly described imports are needed for Webpack to properly create chunks.
const LOCALE_PATH = new Map<string, ImportFunction>([
    [
        '*:common',
        (l) =>
            import(
                /* webpackChunkName: intl-[request] */
                `intl/locale-data/jsonp/${l}.js`
            ),
    ],
    [
        '*:*',
        (l, m) =>
            m === 'pluralrules'
                ? import(
                      /* webpackChunkName: intl-pluralrules-[request] */
                      `@formatjs/intl-pluralrules/dist/locale-data/${l}.js`
                  )
                : import(
                      /* webpackChunkName: intl-relativetimeformat-[request] */
                      `@formatjs/intl-relativetimeformat/dist/locale-data/${l}.js`
                  ),
    ],
]);

/**
 * Finds and applies localizations for Intl polyfills.
 *
 * @param {string} locale - locale to find
 * @param {string} module - module to find locale for
 * @returns {Promise} promise resolved when module is loaded
 */
function findLocale(locale: string, module: string): Promise<any> {
    for (const [key, found] of LOCALE_PATH) {
        const [lc, api] = key.split(':');

        if ((lc === locale || lc === '*') && (api === module || api === '*')) {
            return found(locale, module);
        }
    }

    return Promise.resolve();
}

/**
 * All modern browsers currently do support all required Intl APIs,
 * for the outdated browsers we will polyfill this api on demand
 */

async function polyfill(locale: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (!needs.intl && Intl.DateTimeFormat.supportedLocalesOf([locale]).length === 0) {
        // fallback to polyfill in case, when browser does not support locale we need
        needs.intl = true;
        needs.plural = true;
        needs.relative = true;
    }

    if (needs.intl) {
        promises.push(polyfillIntl(locale));
    } else {
        if (needs.plural) {
            promises.push(polyfillPlural(locale));
        }

        if (needs.relative) {
            promises.push(polyfillRelative(locale));
        }
    }

    try {
        await Promise.all(promises);
    } catch (error) {
        logger.warn('Error loading intl polyfills', {
            error,
        });
    }
}

async function polyfillIntl(locale: string): Promise<void> {
    // do not rely on tests provided by polyfill implementation
    // forcibly apply polyfill, because if this function was called
    // this means that browser does not support some of locales
    const { default: Intl } = await import(
        /* webpackChunkName: "intl" */
        'intl'
    );

    // resolve issue with RegExp errors
    // @see https://github.com/mattlewis92/angular-calendar/issues/274
    // @see https://github.com/mattlewis92/angular-calendar/issues/274
    // @ts-expect-error
    Intl.__disableRegExpRestore();

    window.Intl = Intl;

    // MUST be loaded in series with the main polyfill
    await Promise.all([findLocale(locale, 'common'), polyfillPlural(locale), polyfillRelative(locale)]);
}

async function polyfillPlural(locale: string): Promise<void> {
    await import(
        /* webpackChunkName: "intl-pluralrules" */
        '@formatjs/intl-pluralrules/polyfill'
    );

    // MUST be loaded in series with the main polyfill
    await findLocale(locale, 'pluralrules');
}

async function polyfillRelative(locale: string): Promise<void> {
    await import(
        /* webpackChunkName: "intl-relativetimeformat" */
        '@formatjs/intl-relativetimeformat/polyfill'
    );

    // MUST be loaded in series with the main polyfill
    await findLocale(locale, 'relativetimeformat');
}

export default polyfill;
