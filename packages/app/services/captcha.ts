import { loadScript } from 'app/functions';
import options from 'app/services/api/options';

let readyPromise: Promise<void>;
let lang = 'en';
let sitekey: string;

export type CaptchaID = string;

// For E2E testing purposes only: lets tests pass the captcha by calling `window.e2eCaptchaSetCode(code)`.
// The code is passed to every mounted captcha, so a test doesn't depend on which one of them (e.g. during
// a panel transition) was rendered last
const e2eCallbacks = new Set<(code: string) => void>();

(window as any).e2eCaptchaSetCode = (code: string) => e2eCallbacks.forEach((callback) => callback(code));

export function registerE2eCallback(callback: (code: string) => void): () => void {
    e2eCallbacks.add(callback);

    return () => e2eCallbacks.delete(callback);
}

class Captcha {
    /**
     * @param {DOMNode|string} el - dom node or id of element where to render captcha
     * @param {object} options
     * @param {string} options.skin - skin color (dark|light)
     * @param {Function} options.onSetCode - the callback, that will be called with
     *                                       captcha verification code, after user successfully solves captcha
     *
     * @returns {Promise} - resolves to captchaId
     */
    render(
        el: HTMLElement,
        {
            skin: theme,
            onSetCode: callback,
        }: {
            skin: 'dark' | 'light';
            onSetCode: (code: string) => void;
        },
    ): Promise<CaptchaID> {
        return this.loadApi().then(() =>
            (window as any).grecaptcha.render(el, {
                sitekey,
                theme,
                callback,
            }),
        );
    }

    /**
     * @param {string} captchaId - captcha id, returned from render promise
     */
    reset(captchaId: CaptchaID) {
        this.loadApi().then(() => (window as any).grecaptcha.reset(captchaId));
    }

    /**
     * @param {stirng} newLang
     *
     * @see https://developers.google.com/recaptcha/docs/language
     */
    setLang(newLang: string) {
        lang = newLang;
    }

    /**
     * @param {string} apiKey
     *
     * @see http://www.google.com/recaptcha/admin
     */
    setApiKey(apiKey: string) {
        sitekey = apiKey;
    }

    /**
     * @returns {Promise}
     */
    private loadApi(): Promise<void> {
        if (!readyPromise) {
            readyPromise = Promise.all([
                new Promise((resolve) => {
                    (window as any).onReCaptchaReady = resolve;
                }),
                options.get().then((resp) => this.setApiKey(resp.reCaptchaPublicKey)),
            ]).then(() => {});

            loadScript(`https://recaptcha.net/recaptcha/api.js?onload=onReCaptchaReady&render=explicit&hl=${lang}`);
        }

        return readyPromise;
    }
}

export default new Captcha();
