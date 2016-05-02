let lastId = 0;
export function uniqueId(prefix = 'id') {
    return `${prefix}${++lastId}`;
}
