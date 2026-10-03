import loadSdk from '../loadSdk';
import { CaptchaProvider } from '../types';

let loadPromise: Promise<void> | undefined;

const getApi = () => (window as any).grecaptcha.enterprise;

/**
 * Google reCAPTCHA from Google Cloud (formerly reCAPTCHA Enterprise) with the checkbox key.
 *
 * @see https://cloud.google.com/recaptcha/docs/instrument-web-pages-with-checkbox
 */
const recaptcha: CaptchaProvider = {
    type: 'recaptcha',

    load(lang) {
        // The language is fixed on the script loading
        if (!loadPromise) {
            // The SDK is loaded from recaptcha.net instead of www.google.com, since only this domain is allowed by CSP
            loadPromise = loadSdk(
                `https://recaptcha.net/recaptcha/enterprise.js?onload=onReCaptchaReady&render=explicit&hl=${encodeURIComponent(lang)}`,
                'onReCaptchaReady',
            );
        }

        return loadPromise;
    },

    render(el, { publicKey }, { skin, onSetCode, onExpire }) {
        return getApi().render(el, {
            sitekey: publicKey,
            theme: skin,
            callback: onSetCode,
            'expired-callback': onExpire,
        });
    },

    reset(id) {
        getApi().reset(id);
    },

    destroy() {
        // reCAPTCHA has no API to destroy a widget. Removing its element from the DOM is enough
    },
};

export default recaptcha;
