function serialize(data) {
    return Object.keys(data)
        .map(
            (keyName) =>
                [keyName, typeof data[keyName] === 'undefined' ? '' : data[keyName]]
                    .map(encodeURIComponent)
                    .join('=')
        )
        .join('&')
        ;
}

const toJSON = (resp) => resp.json();
const handleResponse = (resp) => Promise[resp.success ? 'resolve' : 'reject'](resp);

export default {
    post(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: serialize(data)
        })
        .then(toJSON)
        .then(handleResponse)
        ;
    },
    get(url, data) {
        if (typeof data === 'object') {
            const separator = url.indexOf('?') === -1 ? '?' : '&';
            url += separator + serialize(data);
        }

        return fetch(url, {
            headers: {
                Accept: 'application/json'
            }
        })
        .then(toJSON)
        .then(handleResponse)
        ;
    }
};
