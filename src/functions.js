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
