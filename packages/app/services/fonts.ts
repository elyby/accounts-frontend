// Each file declares a separate @font-face with its own unicode-range for every subset (latin, cyrillic, greek, etc.),
// so the browser downloads only the subsets, whose glyphs are actually used on the page
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto-condensed/400.css';

import logger from 'app/services/logger';

const FONTS: ReadonlyArray<string> = [
    '400 1em Roboto',
    '500 1em Roboto',
    '400 1em "Roboto Condensed"',
];

// The browser loads only the subsets, that intersect with the passed text. Latin and Cyrillic subsets cover
// most of the interface languages. Other subsets will be loaded on demand, when the text using them will be rendered
const SAMPLE_TEXT = 'BESbswy БЕСбсв';

const TIMEOUT = 2000;

export function loadFonts(): Promise<void> {
    if (!document.fonts) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            logger.breadcrumb('Fonts loading timed out');
            resolve();
        }, TIMEOUT);

        Promise.all(FONTS.map((font) => document.fonts.load(font, SAMPLE_TEXT)))
            .catch((error) => logger.breadcrumb('Failed loading the fonts', { error }))
            .finally(() => {
                clearTimeout(timer);
                resolve();
            });
    });
}
