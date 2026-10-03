import expect from 'app/test/unexpected';
import sinon, { SinonSandbox } from 'sinon';
import options from 'app/services/api/options';
import logger from 'app/services/logger';

import { clearResolvedCaptcha, getProvidersPriority, NoCaptchaAvailableError, registerE2eCallback, resolveCaptcha } from './index';
import recaptcha from './providers/recaptcha';
import yandex from './providers/yandex';

describe('services/captcha', () => {
    describe('#getProvidersPriority', () => {
        it('should prefer Yandex for the Russian region locales', () => {
            expect(getProvidersPriority('ru'), 'to equal', ['yandex', 'recaptcha']);
            expect(getProvidersPriority('be'), 'to equal', ['yandex', 'recaptcha']);
            expect(getProvidersPriority('ru-RU'), 'to equal', ['yandex', 'recaptcha']);
        });

        it('should prefer Google for other locales', () => {
            expect(getProvidersPriority('en'), 'to equal', ['recaptcha', 'yandex']);
            expect(getProvidersPriority('uk'), 'to equal', ['recaptcha', 'yandex']);
            expect(getProvidersPriority('pt-BR'), 'to equal', ['recaptcha', 'yandex']);
        });
    });

    describe('#resolveCaptcha', () => {
        let sandbox: SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            clearResolvedCaptcha();
            sandbox.stub(logger, 'warn');
        });

        afterEach(() => sandbox.restore());

        const givenProviders = (captcha: Record<string, { publicKey: string }>) =>
            sandbox.stub(options, 'get').resolves({ captcha, originalResponse: new Response() });

        it('should pick the preferred provider', async () => {
            givenProviders({ recaptcha: { publicKey: 'g' }, yandex: { publicKey: 'y' } });
            sandbox.stub(recaptcha, 'load').resolves();
            const yandexLoad = sandbox.stub(yandex, 'load').resolves();

            const { provider, params } = await resolveCaptcha('ru');

            expect(provider, 'to be', yandex);
            expect(params, 'to equal', { publicKey: 'y' });
            expect(yandexLoad, 'to have a call satisfying', ['ru']);
        });

        it('should fallback to the next provider when the preferred one failed to load', async () => {
            givenProviders({ recaptcha: { publicKey: 'g' }, yandex: { publicKey: 'y' } });
            sandbox.stub(recaptcha, 'load').rejects(new Error('blocked'));
            sandbox.stub(yandex, 'load').resolves();

            const { provider } = await resolveCaptcha('en');

            expect(provider, 'to be', yandex);
        });

        it('should skip providers missing in options', async () => {
            givenProviders({ recaptcha: { publicKey: 'g' } });
            const yandexLoad = sandbox.stub(yandex, 'load').resolves();
            sandbox.stub(recaptcha, 'load').resolves();

            const { provider } = await resolveCaptcha('kk');

            expect(provider, 'to be', recaptcha);
            expect(yandexLoad, 'was not called');
        });

        it('should memoize the chosen provider', async () => {
            const getParams = givenProviders({ recaptcha: { publicKey: 'g' } });
            sandbox.stub(recaptcha, 'load').resolves();

            await resolveCaptcha('en');
            await resolveCaptcha('de');

            expect(getParams, 'was called once');
        });

        it('should keep the chosen provider after the locale change', async () => {
            givenProviders({ recaptcha: { publicKey: 'g' }, yandex: { publicKey: 'y' } });
            sandbox.stub(recaptcha, 'load').resolves();
            const yandexLoad = sandbox.stub(yandex, 'load').resolves();

            const first = await resolveCaptcha('en');
            const second = await resolveCaptcha('ru');

            expect(first.provider, 'to be', recaptcha);
            expect(second.provider, 'to be', recaptcha);
            expect(yandexLoad, 'was not called');
        });

        it('should reject when no provider is available', async () => {
            givenProviders({ recaptcha: { publicKey: 'g' } });
            sandbox.stub(recaptcha, 'load').rejects(new Error('blocked'));

            await expect(resolveCaptcha('uz'), 'to be rejected with', expect.it('to be a', NoCaptchaAvailableError));
        });
    });

    describe('e2eCaptchaSetCode', () => {
        it('should pass the value to the registered callbacks', () => {
            const callback = sinon.spy();
            const unregister = registerE2eCallback(callback);

            (window as any).e2eCaptchaSetCode('foo');
            (window as any).e2eCaptchaSetCode('bar', 'yandex');
            unregister();
            (window as any).e2eCaptchaSetCode('baz');

            expect(callback, 'to have calls satisfying', [
                [{ type: 'recaptcha', token: 'foo' }],
                [{ type: 'yandex', token: 'bar' }],
            ]);
        });
    });
});
