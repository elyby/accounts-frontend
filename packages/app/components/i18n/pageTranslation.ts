import logger from 'app/services/logger';

// Google Translate (Chrome, Android WebView) marks the translated page with one of these classes
const GOOGLE_TRANSLATED_CLASS_REGEX = /(^|\s)translated-(ltr|rtl)(\s|$)/;

// React DOM keeps the fiber in this property of every node it creates. It's an internal API (React 16 used
// "__reactInternalInstance$"), so the tests render a real node to catch its change on React upgrades
const REACT_FIBER_KEY_PREFIX = '__reactFiber$';

/**
 * - google: Google Translate's class on <html>
 * - lang: the `lang` of <html> is changed to something different from the app's locale
 * - font: <font> elements, that weren't rendered by React, wrap our texts (Google Translate, TWP in the "show original" mode, etc.)
 */
type Translator = 'google' | 'lang' | 'font';

export function isRenderedByReact(node: Node): boolean {
    return Object.keys(node).some((key) => key.startsWith(REACT_FIBER_KEY_PREFIX));
}

function isForeignFont(node: Node): boolean {
    return node.nodeName === 'FONT' && !isRenderedByReact(node);
}

function containsForeignFont(node: Node): boolean {
    if (isForeignFont(node)) {
        return true;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }

    return Array.from((node as Element).getElementsByTagName('font')).some(isForeignFont);
}

/**
 * Browsers' page translators (Google Translate, Edge, Safari, extensions) replace the text nodes, created by React,
 * which breaks its updates (e.g. "NotFoundError: Failed to execute 'removeChild' on 'Node'").
 * To know how often it happens, the translation is attached to all the events as the `page.translator`
 * and `page.translated_to` tags and the first translation since the page load is reported as an info event.
 *
 * The translators set the target language to the `lang` attribute of the <html> element,
 * which otherwise matches the app's locale (see IntlProvider). The ones that don't, are detected by
 * the <font> elements they wrap the texts into, but the language stays unknown then
 */
export function observePageTranslation(
    getAppLocale: () => string,
    root: Element | null = document.getElementById('app'),
): () => void {
    const html = document.documentElement;
    let translator: Translator | undefined;
    let translatedTo: string | undefined;
    let hasForeignFonts = false;
    let isReported = false;

    const update = () => {
        const lang = html.lang;
        let newTranslator: Translator | undefined;

        if (GOOGLE_TRANSLATED_CLASS_REGEX.test(html.className)) {
            newTranslator = 'google';
        } else if (lang !== '' && lang !== getAppLocale()) {
            // Helmet sets the lang after the locale is changed in the store, so its own changes always match it
            newTranslator = 'lang';
        } else if (hasForeignFonts) {
            newTranslator = 'font';
        }

        let newTranslatedTo: string | undefined;

        if (newTranslator) {
            newTranslatedTo = newTranslator === 'font' ? 'unknown' : lang || 'unknown';
        }

        if (newTranslator === translator && newTranslatedTo === translatedTo) {
            return;
        }

        translator = newTranslator;
        translatedTo = newTranslatedTo;
        logger.setTag('page.translator', translator);
        logger.setTag('page.translated_to', translatedTo);

        if (translator && !isReported) {
            isReported = true;
            logger.info('Page translation detected', { translator, translatedTo, appLocale: getAppLocale() });
        }
    };

    // Watches every React commit, so it's disconnected as soon as the first foreign <font> is found
    const fontObserver = new MutationObserver((records) => {
        if (records.some((record) => Array.from(record.addedNodes).some(containsForeignFont))) {
            hasForeignFonts = true;
            fontObserver.disconnect();
            update();
        }
    });

    const observeFonts = () => root && fontObserver.observe(root, { childList: true, subtree: true });

    const htmlObserver = new MutationObserver(() => {
        // The translation might be reverted, e.g. by the Google Translate's "Show original"
        if (hasForeignFonts && root && !containsForeignFont(root)) {
            hasForeignFonts = false;
            observeFonts();
        }

        update();
    });

    htmlObserver.observe(html, { attributes: true, attributeFilter: ['lang', 'class'] });
    observeFonts();

    return () => {
        htmlObserver.disconnect();
        fontObserver.disconnect();
    };
}
