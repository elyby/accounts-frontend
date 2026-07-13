import logger from 'app/services/logger';

/**
 * All modern browsers currently do support all required Intl APIs,
 * for the outdated browsers we will polyfill this api on demand
 */
async function polyfill(locale: string): Promise<void> {
    const promises: Promise<void>[] = [];

    let intlSupported = !!window.Intl;
    let pluralSupported = !!window.Intl?.PluralRules;
    let relativeSupported = !!window.Intl?.RelativeTimeFormat;
    let localeSupported = intlSupported && Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0;

    // If locale isn't supported, then we need to fully replace native intl in order to introduce a new locale
    if (!intlSupported || !localeSupported) {
        promises.push(polyfillIntl(locale));
    } else {
        if (!pluralSupported) {
            promises.push(polyfillPlural(locale));
        }

        if (!relativeSupported) {
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
    await Promise.all([
        polyfillLocale(locale),
        polyfillPlural(locale),
        polyfillRelative(locale),
    ]);
}

async function polyfillLocale(locale: string): Promise<void> {
    try {
        await import(
            /* webpackChunkName: "intl-[request]" */
            `./overrides/intl/${locale}.js`
        );
    } catch {
        await import(
            /* webpackChunkName: "intl-[request]" */
            `intl/locale-data/jsonp/${locale}.js`
        );
    }
}

async function polyfillPlural(locale: string): Promise<void> {
    await import(
        /* webpackChunkName: "intl-pluralrules" */
        '@formatjs/intl-pluralrules/polyfill'
    );

    // MUST be loaded in series with the main polyfill
    try {
        await import(
            // WARNING: .js extension is required for proper function of ContextReplacementPlugin
            /* webpackChunkName: "intl-pluralrules-[request]" */
            `./overrides/pluralrules/${locale}.js`
        );
    } catch {
        await import(
            // WARNING: .js extension is required for proper function of ContextReplacementPlugin
            /* webpackChunkName: "intl-pluralrules-[request]" */
            `@formatjs/intl-pluralrules/dist/locale-data/${locale}.js`
        );
    }
}

async function polyfillRelative(locale: string): Promise<void> {
    await import(
        /* webpackChunkName: "intl-relativetimeformat" */
        '@formatjs/intl-relativetimeformat/polyfill'
    );

    // MUST be loaded in series with the main polyfill
    try {
        await import(
            /* webpackChunkName: "intl-relativetimeformat-[request]" */
            `./overrides/relativetimeformat/${locale}.js`
        );
    } catch {
        await import(
            /* webpackChunkName: "intl-relativetimeformat-[request]" */
            `@formatjs/intl-relativetimeformat/dist/locale-data/${locale}.js`
        );
    }
}

export default polyfill;
