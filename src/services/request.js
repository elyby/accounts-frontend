function convertQueryValue(value) {
    if (typeof value === 'undefined') {
        return '';
    }

    if (value === true) {
        return 1;
    }

    if (value === false) {
        return 0;
    }

    return value;
}

function buildQuery(data) {
    return Object.keys(data)
        .map(
            (keyName) =>
                [keyName, convertQueryValue(data[keyName])]
                    .map(encodeURIComponent)
                    .join('=')
        )
        .join('&')
        ;
}

let authToken;

const toJSON = (resp) => resp.json();
// if resp.success does not exist - degradating to HTTP status codes
const handleResponse = (resp) => Promise[resp.success || typeof resp.success === 'undefined' ? 'resolve' : 'reject'](resp);
const getDefaultHeaders = () => {
    const header = {Accept: 'application/json'};

    if (authToken) {
        header.Authorization = `Bearer ${authToken}`;
    }

    return header;
};

export default {
    post(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                ...getDefaultHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: buildQuery(data)
        })
        .then(toJSON)
        .then(handleResponse)
        ;
    },

    get(url, data) {
        if (typeof data === 'object') {
            const separator = url.indexOf('?') === -1 ? '?' : '&';
            url += separator + buildQuery(data);
        }

        return fetch(url, {
            headers: getDefaultHeaders()
        })
        .then(toJSON)
        .then(handleResponse)
        ;
    },

    buildQuery,

    setAuthToken(tkn) {
        authToken = tkn;
    }
};
