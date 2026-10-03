import options from 'app/services/api/options';
import logger from 'app/services/logger';

import recaptcha from './providers/recaptcha';
import yandex from './providers/yandex';
import { CaptchaProvider, CaptchaPublicParams, CaptchaValue } from './types';

export type { CaptchaProvider, CaptchaPublicParams, CaptchaValue, CaptchaWidgetId } from './types';

const PROVIDERS: ReadonlyArray<CaptchaProvider> = [recaptcha, yandex];

/**
 * Locales of the Eastern Europe/Asia region, where Yandex SmartCaptcha is preferred over Google reCAPTCHA.
 *
 * Ukrainian is intentionally omitted: Yandex services are blocked in Ukraine.
 */
const YANDEX_PREFERRED_LOCALES: ReadonlyArray<string> = ['ru', 'be', 'kk', 'ky', 'tg', 'tt', 'udm', 'uz'];

/**
 * Returns the captcha providers types in the order they should be tried for the passed locale
 */
export function getProvidersPriority(locale: string): Array<string> {
    const [language] = locale.toLowerCase().split(/[-_]/);

    if (YANDEX_PREFERRED_LOCALES.includes(language)) {
        return [yandex.type, recaptcha.type];
    }

    return [recaptcha.type, yandex.type];
}

export interface ResolvedCaptcha {
    provider: CaptchaProvider;
    params: CaptchaPublicParams;
}

export class NoCaptchaAvailableError extends Error {
    constructor() {
        super('None of the captcha providers is available');
        this.name = 'NoCaptchaAvailableError';
    }
}

let resolved: Promise<ResolvedCaptcha> | null = null;

/**
 * Picks the first provider, which is enabled on the backend and whose SDK was loaded successfully.
 */
export function resolveCaptcha(locale: string): Promise<ResolvedCaptcha> {
    if (!resolved) {
        const promise = doResolve(getProvidersPriority(locale), locale);
        resolved = promise;
        // Don't cache the failure: the next widget will try again (e.g. when the options request failed)
        promise.catch(() => {
            if (resolved === promise) {
                resolved = null;
            }
        });
    }

    return resolved;
}

/**
 * Forgets the previously chosen provider. Intended for tests
 */
export function clearResolvedCaptcha(): void {
    resolved = null;
}

async function doResolve(priority: Array<string>, locale: string): Promise<ResolvedCaptcha> {
    const { captcha: available } = await options.get();

    for (const type of priority) {
        const provider = PROVIDERS.find((item) => item.type === type);
        const params = available[type];

        if (!provider || !params) {
            continue;
        }

        try {
            await provider.load(locale);

            return { provider, params };
        } catch (error) {
            logger.warn('Failed to load captcha provider, trying the next one', {
                provider: type,
                error,
            });
        }
    }

    throw new NoCaptchaAvailableError();
}

// For E2E testing purposes only: lets tests pass the captcha by calling `window.e2eCaptchaSetCode(code, type)`.
// The value is passed to every mounted captcha, so a test doesn't depend on which one of them (e.g. during
// a panel transition) was rendered last
const e2eCallbacks = new Set<(value: CaptchaValue) => void>();

(window as any).e2eCaptchaSetCode = (token: string, type: string = recaptcha.type) =>
    e2eCallbacks.forEach((callback) => callback({ type, token }));

export function registerE2eCallback(callback: (value: CaptchaValue) => void): () => void {
    e2eCallbacks.add(callback);

    return () => e2eCallbacks.delete(callback);
}
