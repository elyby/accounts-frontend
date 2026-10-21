import expect from 'app/test/unexpected';

import altcha from './index';

describe('services/captcha/providers/altcha', () => {
    describe('#load', () => {
        afterEach(() => {
            // @ts-expect-error restores the jsdom's own state, where there is no Web Crypto API
            delete window.crypto.subtle;
        });

        it('should be loaded, when the Web Crypto API is available', async () => {
            Object.defineProperty(window.crypto, 'subtle', { value: {}, configurable: true });

            await expect(altcha.load('en'), 'to be fulfilled');
        });

        it('should reject without the Web Crypto API, so the next provider is tried', async () => {
            // jsdom has no Web Crypto API, as the browsers outside the secure contexts
            await expect(altcha.load('en'), 'to be rejected with', /Web Crypto API is unavailable/);
        });
    });
});
