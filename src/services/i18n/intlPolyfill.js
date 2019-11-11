
// @flow
import logger from 'services/logger';

const needs = {
    intl: !window.Intl,
    plural: !window?.Intl?.PluralRules,
    relative: !window?.Intl?.RelativeTimeFormat
};

/**
 * All modern browsers currently do support all required Intl APIs,
 * for the outdated browsers we will polyfill this api on demand
 */

async function polyfill(locale: string): Promise<void> {
    const promises = [];

    if (!needs.intl
      && Intl.DateTimeFormat.supportedLocalesOf([locale]).length === 0
    ) {
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
            error
        });
    }
}

async function polyfillIntl(locale: string): Promise<void> {
    // do not rely on tests provided by polyfill implementation
    // forcibly apply polyfill, because if this function was called
    // this means that browser does not support some of locales
    const {default: Intl} = await import(
        /* webpackChunkName: "intl" */
        'intl'
    );

    window.Intl = Intl;

    // MUST be loaded in series with the main polyfill
    await Promise.all([
        import(
            // WARNING: .js extension is required for proper function of ContextReplacementPlugin
            /* webpackChunkName: "intl-[request]" */
            `intl/locale-data/jsonp/${locale}.js`
        ),
        polyfillPlural(locale),
        polyfillRelative(locale),
    ]);
}

async function polyfillPlural(locale: string): Promise<void> {
    await import(
        /* webpackChunkName: "intl-pluralrules" */
        '@formatjs/intl-pluralrules/polyfill'
    );

    // MUST be loaded in series with the main polyfill
    await import(
        // WARNING: .js extension is required for proper function of ContextReplacementPlugin
        /* webpackChunkName: "intl-pluralrules-[request]" */
        `@formatjs/intl-pluralrules/dist/locale-data/${locale}.js`
    );
}

async function polyfillRelative(locale: string): Promise<void> {
    await import(
        /* webpackChunkName: "intl-relativetimeformat" */
        '@formatjs/intl-relativetimeformat/polyfill'
    );

    // MUST be loaded in series with the main polyfill
    await import(
        // WARNING: .js extension is required for proper function of ContextReplacementPlugin
        /* webpackChunkName: "intl-relativetimeformat-[request]" */
        `@formatjs/intl-relativetimeformat/dist/locale-data/${locale}.js`
    );
}

export default polyfill;
