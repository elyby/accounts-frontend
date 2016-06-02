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

function buildQuery(data = {}) {
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

function doFetch(...args) {
    // NOTE: we are wrapping fetch, because it is returning
    // Promise instance that can not be pollyfilled with Promise.prototype.finally
    return new Promise((resolve, reject) => fetch(...args).then(resolve, reject));
}

let authToken;

const checkStatus = (resp) => Promise[resp.status >= 200 && resp.status < 300 ? 'resolve' : 'reject'](resp);
const toJSON = (resp) => resp.json();
const rejectWithJSON = (resp) => toJSON(resp).then((resp) => {throw resp;});
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
        return doFetch(url, {
            method: 'POST',
            headers: {
                ...getDefaultHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: buildQuery(data)
        })
        .then(checkStatus)
        .then(toJSON, rejectWithJSON)
        .then(handleResponse)
        ;
    },

    get(url, data) {
        if (typeof data === 'object') {
            const separator = url.indexOf('?') === -1 ? '?' : '&';
            url += separator + buildQuery(data);
        }

        return doFetch(url, {
            headers: getDefaultHeaders()
        })
        .then(checkStatus)
        .then(toJSON, rejectWithJSON)
        .then(handleResponse)
        ;
    },

    buildQuery,

    setAuthToken(tkn) {
        authToken = tkn;
    }
};
