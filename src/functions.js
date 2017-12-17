// @flow
let lastId = 0;
export function uniqueId(prefix: string = 'id'): string {
    return `${prefix}${++lastId}`;
}

/**
 * @param {object} obj
 * @param {array} keys
 *
 * @return {object}
 */
export function omit(obj: Object, keys: Array<string>): Object {
    const newObj = {...obj};

    keys.forEach((key) => {
        Reflect.deleteProperty(newObj, key);
    });

    return newObj;
}

/**
 * Asynchronously loads script
 *
 * @param {string} src
 *
 * @return {Promise}
 */
export function loadScript(src: string): Promise<*> {
    const script = document.createElement('script');

    script.async = true;
    script.defer = true;
    script.src = src;

    return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;

        if (document && document.body) {
            document.body.appendChild(script);
        }
    });
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source https://github.com/component/debounce
 *
 * @param {function} function - function to wrap
 * @param {number} [timeout=100] - timeout in ms
 * @param {bool} [immediate=false] - whether to execute at the beginning
 */
export { default as debounce } from 'debounce';

/**
 * @param {string} jwt
 *
 * @throws {Error} If can not decode token
 *
 * @return {object} - decoded jwt payload
 */
export function getJwtPayload(jwt: string): Object {
    const parts = (jwt || '').split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid jwt token');
    }

    try {
        return JSON.parse(atob(parts[1]));
    } catch (err) {
        throw new Error('Can not decode jwt token');
    }
}

const localeToCountryCode = {
    en: 'gb',
    be: 'by',
    pt: 'br',
    uk: 'ua',
    vi: 'vn',
    sl: 'si',
};

/**
 * Возвращает для указанной локали её флаг с учётом всех нюансов загрузки флага
 * и подбора соответствующего локали флага.
 *
 * @param {string} locale
 * @return {*}
 */
export function requireLocaleFlag(locale: string) {
    return require(`flag-icon-css/flags/4x3/${localeToCountryCode[locale] || locale}.svg`);
}
