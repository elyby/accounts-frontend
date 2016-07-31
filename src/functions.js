let lastId = 0;
export function uniqueId(prefix = 'id') {
    return `${prefix}${++lastId}`;
}

/**
 * @param {object} obj
 * @param {array} keys
 *
 * @return {object}
 */
export function omit(obj, keys) {
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
export function loadScript(src) {
    const script = document.createElement('script');

    script.async = true;
    script.defer = true;
    script.src = src;

    return new Promise((resolve, reject) => {
        script.onlaod = resolve;
        script.onerror = reject;

        document.body.appendChild(script);
    });
}
