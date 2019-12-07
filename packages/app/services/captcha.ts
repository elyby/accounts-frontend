import { loadScript } from 'app/functions';
import options from 'app/services/api/options';

let readyPromise: Promise<void>;
let lang = 'en';
let sitekey;

export type CaptchaID = string;

export default {
  /**
   * @param {DOMNode|string} el - dom node or id of element where to render captcha
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
  },

  /**
   * @param {string} captchaId - captcha id, returned from render promise
   */
  reset(captchaId: CaptchaID) {
    this.loadApi().then(() => (window as any).grecaptcha.reset(captchaId));
  },

  /**
   * @param {stirng} newLang
   *
   * @see https://developers.google.com/recaptcha/docs/language
   */
  setLang(newLang: string) {
    lang = newLang;
  },

  /**
   * @param {string} apiKey
   *
   * @see http://www.google.com/recaptcha/admin
   */
  setApiKey(apiKey: string) {
    sitekey = apiKey;
  },

  /**
   * @api private
   *
   * @returns {Promise}
   */
  loadApi(): Promise<void> {
    if (!readyPromise) {
      readyPromise = Promise.all([
        new Promise(resolve => {
          (window as any).onReCaptchaReady = resolve;
        }),
        options.get().then(resp => this.setApiKey(resp.reCaptchaPublicKey)),
      ]).then(() => {});

      loadScript(
        `https://recaptcha.net/recaptcha/api.js?onload=onReCaptchaReady&render=explicit&hl=${lang}`,
      );
    }

    return readyPromise;
  },
};
