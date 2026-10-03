import { loadScript } from 'app/functions';

export const SDK_LOAD_TIMEOUT = 5000;

/**
 * Loads a captcha SDK, that reports its readiness by calling the global onload callback.
 * The script's own load event isn't enough, since SDKs load additional resources after it.
 *
 * Rejects when the script fails to load or the callback isn't called within the timeout
 * (e.g. the provider is blocked in the user's region and the request hangs).
 */
export default function loadSdk(src: string, callbackName: string, timeout: number = SDK_LOAD_TIMEOUT): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${src} to be ready`)), timeout);

        (window as any)[callbackName] = () => {
            clearTimeout(timer);
            resolve();
        };

        loadScript(src).catch(() => {
            clearTimeout(timer);
            reject(new Error(`Failed to load ${src}`));
        });
    });
}
