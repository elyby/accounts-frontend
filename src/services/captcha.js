import { loadScript } from 'functions';

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
     * @return {Promise}
     */
    render(el, {skin: theme, onSetCode: callback}) {
        if (!sitekey) {
            throw new Error('Site key is required to render captcha');
        }

        return loadApi().then(() =>
            window.grecaptcha.render(el, {
                sitekey,
                theme,
                callback
            })
        );
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
    }
};

function loadApi() {
    if (!readyPromise) {
        readyPromise = new Promise((resolve) => {
            window.onReCaptchaReady = resolve;
        });

        loadScript(`https://www.google.com/recaptcha/api.js?onload=onReCaptchaReady&render=explicit&hl=${lang}`);
    }

    return readyPromise;
}
