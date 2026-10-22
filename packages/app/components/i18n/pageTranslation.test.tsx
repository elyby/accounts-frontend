import React from 'react';
import ReactDOM from 'react-dom';

import logger from 'app/services/logger';

import { isRenderedByReact, observePageTranslation } from './pageTranslation';

// MutationObserver callbacks are called in a microtask
const flush = () => new Promise((resolve) => setTimeout(resolve));

/**
 * Replaces the text node with <font><font>text</font></font>, like the translators do
 */
function wrapTextLikeTranslator(text: Text): HTMLElement {
    const outer = document.createElement('font');
    outer.setAttribute('style', 'vertical-align: inherit;');
    const inner = document.createElement('font');
    inner.setAttribute('style', 'vertical-align: inherit;');
    inner.textContent = text.data;
    outer.appendChild(inner);
    text.replaceWith(outer);

    return outer;
}

describe('isRenderedByReact', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
    });

    // Relies on the React's internals: the test will fail if they are changed in a new React version
    it('should recognize the elements and the text nodes rendered by React', () => {
        // <font> is deprecated and missing in the JSX types.
        // Several children, because React sets a single text child as the textContent, without own text node
        ReactDOM.render(React.createElement('font', null, 'Hello, ', 'world'), container);

        const font = container.firstChild!;

        expect(font.nodeName).toBe('FONT');
        expect(isRenderedByReact(font)).toBe(true);
        expect(isRenderedByReact(font.firstChild!)).toBe(true);
    });

    it('should not recognize the nodes created by other code', () => {
        expect(isRenderedByReact(document.createElement('font'))).toBe(false);
        expect(isRenderedByReact(document.createTextNode('text'))).toBe(false);
    });
});

describe('observePageTranslation', () => {
    const html = document.documentElement;
    let root: HTMLElement;
    let locale: string;
    let disconnect: () => void;
    let info: jest.SpyInstance;
    let setTag: jest.SpyInstance;

    const tags = () => Object.fromEntries(setTag.mock.calls);

    beforeEach(() => {
        html.lang = 'en';
        html.className = '';
        locale = 'en';
        root = document.createElement('div');
        document.body.appendChild(root);
        info = jest.spyOn(logger, 'info').mockImplementation(() => {});
        setTag = jest.spyOn(logger, 'setTag').mockImplementation(() => {});
        disconnect = observePageTranslation(() => locale, root);
    });

    afterEach(() => {
        disconnect();
        ReactDOM.unmountComponentAtNode(root);
        root.remove();
        jest.restoreAllMocks();
    });

    it('should detect Google Translate', async () => {
        html.lang = 'ar';
        html.className = 'translated-rtl';
        await flush();

        expect(tags()).toEqual({ 'page.translator': 'google', 'page.translated_to': 'ar' });
        expect(info).toHaveBeenCalledTimes(1);
        expect(info).toHaveBeenCalledWith('Page translation detected', {
            translator: 'google',
            translatedTo: 'ar',
            appLocale: 'en',
        });
    });

    it('should detect other translators by the changed lang', async () => {
        html.lang = 'vi';
        await flush();

        expect(tags()).toEqual({ 'page.translator': 'lang', 'page.translated_to': 'vi' });
        expect(info).toHaveBeenCalledTimes(1);
    });

    it('should keep the translation when an unrelated class is changed', async () => {
        html.lang = 'vi';
        await flush();
        setTag.mockClear();
        html.className = 'foo';
        await flush();

        expect(setTag).not.toHaveBeenCalled();
    });

    it('should ignore the locale change by the app', async () => {
        locale = 'ru';
        html.lang = 'ru';
        await flush();

        expect(setTag).not.toHaveBeenCalled();
        expect(info).not.toHaveBeenCalled();
    });

    it('should remove the tags when the translation is reverted', async () => {
        html.lang = 'ar';
        html.className = 'translated-rtl';
        await flush();
        html.lang = 'en';
        html.className = '';
        await flush();

        expect(tags()).toEqual({ 'page.translator': undefined, 'page.translated_to': undefined });
    });

    it('should detect the texts wrapped into <font> by a translator', async () => {
        ReactDOM.render(<p>Hello</p>, root);
        await flush();

        wrapTextLikeTranslator(root.querySelector('p')!.firstChild as Text);
        await flush();

        expect(tags()).toEqual({ 'page.translator': 'font', 'page.translated_to': 'unknown' });
        expect(info).toHaveBeenCalledWith('Page translation detected', {
            translator: 'font',
            translatedTo: 'unknown',
            appLocale: 'en',
        });
    });

    it('should ignore <font> rendered by React', async () => {
        ReactDOM.render(<p>{React.createElement('font', null, 'Hello')}</p>, root);
        await flush();

        expect(setTag).not.toHaveBeenCalled();
        expect(info).not.toHaveBeenCalled();
    });

    it('should prefer the translation language from <html> over the <font> detection', async () => {
        ReactDOM.render(<p>Hello</p>, root);
        await flush();
        wrapTextLikeTranslator(root.querySelector('p')!.firstChild as Text);
        html.lang = 'ar';
        html.className = 'translated-rtl';
        await flush();

        expect(tags()).toEqual({ 'page.translator': 'google', 'page.translated_to': 'ar' });
    });

    it('should remove the tags when the <font> translation is reverted along with <html> changes', async () => {
        ReactDOM.render(<p>Hello</p>, root);
        await flush();
        const text = root.querySelector('p')!.firstChild as Text;
        const font = wrapTextLikeTranslator(text);
        html.lang = 'ar';
        html.className = 'translated-rtl';
        await flush();

        font.replaceWith(text);
        html.lang = 'en';
        html.className = '';
        await flush();

        expect(tags()).toEqual({ 'page.translator': undefined, 'page.translated_to': undefined });

        // The <font> detection works again
        wrapTextLikeTranslator(text);
        await flush();

        expect(tags()).toEqual({ 'page.translator': 'font', 'page.translated_to': 'unknown' });
    });

    it('should report only once until the page is reloaded', async () => {
        html.lang = 'ar';
        await flush();
        html.lang = 'en';
        await flush();
        html.lang = 'de';
        await flush();

        expect(tags()).toEqual({ 'page.translator': 'lang', 'page.translated_to': 'de' });
        expect(info).toHaveBeenCalledTimes(1);
    });
});
