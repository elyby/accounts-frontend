import type { CaptchaProvider } from 'app/services/captcha/types';
import Altcha from 'app/components/ui/altcha/Altcha';

const altcha: CaptchaProvider = {
    type: 'altcha',

    load() {
        // Everything is bundled, there is nothing to load. The challenge is solved with the Web Crypto API,
        // which browsers provide in the secure contexts only (HTTPS or localhost), so without it the next
        // provider is tried. Otherwise ALTCHA is never unavailable, while it's enabled on the backend
        if (!crypto.subtle) {
            return Promise.reject(new Error('The Web Crypto API is unavailable, the page is not in a secure context'));
        }

        return Promise.resolve();
    },

    Component: Altcha,
};

export default altcha;
