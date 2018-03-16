import { loadScript } from 'functions';
import options from 'services/api/options';

let readyPromise;
let lang = 'en';
let sitekey;

export default {
    /**
     * @param {DOMNode|string} el - dom node or id of element where to render captcha
     * @param {string} options.skin - skin color (dark|light)
     * @param {function} options.onSetCode - the callback, that will be called with
     *                                       captcha verification code, after user successfully solves captcha
     *
     * @return {Promise} - resolves to captchaId
     */
    render(el, {skin: theme, onSetCode: callback}) {
        return this.loadApi().then(() =>
            window.grecaptcha.render(el, {
                sitekey,
                theme,
                callback
            })
        );
    },

    /**
     * @param {string} captchaId - captcha id, returned from render promise
     */
    reset(captchaId) {
        this.loadApi().then(() => window.grecaptcha.reset(captchaId));
    },

    /**
     * @param {stirng} newLang
     *
     * @see https://developers.google.com/recaptcha/docs/language
     */
    setLang(newLang) {
        lang = newLang;
    },

    /**
     * @param {string} apiKey
     *
     * @see http://www.google.com/recaptcha/admin
     */
    setApiKey(apiKey) {
        sitekey = apiKey;
    },

    /**
     * @api private
     *
     * @return {Promise}
     */
    loadApi() {
        if (!readyPromise) {
            readyPromise = Promise.all([
                new Promise((resolve) => {
                    window.onReCaptchaReady = resolve;
                }),
                options.get().then((resp) => this.setApiKey(resp.reCaptchaPublicKey))
            ]);

            loadScript(`https://recaptcha.net/recaptcha/api.js?onload=onReCaptchaReady&render=explicit&hl=${lang}`);
        }

        return readyPromise;
    }
};

