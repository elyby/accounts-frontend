import loadSdk from '../loadSdk';
import { CaptchaProvider } from '../types';

let loadPromise: Promise<void> | undefined;

const getApi = () => (window as any).smartCaptcha;

/**
 * @see https://yandex.cloud/docs/smartcaptcha/concepts/widget-methods
 */
const yandex: CaptchaProvider = {
    type: 'yandex',

    load() {
        if (!loadPromise) {
            loadPromise = loadSdk(
                'https://smartcaptcha.cloud.yandex.ru/captcha.js?render=onload&onload=onSmartCaptchaReady',
                'onSmartCaptchaReady',
            );
        }

        return loadPromise;
    },

    render(el, { publicKey }, { skin, lang, onSetCode, onExpire }) {
        const api = getApi();
        const id = api.render(el, {
            sitekey: publicKey,
            // When received an unknown language, SDK will try to find the preferred language itself
            hl: lang,
            // Isn't documented, but supported by the SDK: 'auto' | 'light' | 'dark'
            theme: skin,
            callback: onSetCode,
        });
        api.subscribe(id, 'token-expired', onExpire);

        return id;
    },

    reset(id) {
        getApi().reset(id);
    },

    destroy(id) {
        getApi().destroy(id);
    },
};

export default yandex;
