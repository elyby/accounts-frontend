function serialize(data) {
    return Object.keys(data)
        .map(
            (keyName) =>
                [keyName, data[keyName]]
                    .map(encodeURIComponent)
                    .join('=')
        )
        .join('&')
        ;
}

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
        .then((resp) => resp.json())
        .then((resp) => Promise[resp.success ? 'resolve' : 'reject'](resp))
        ;
    }
};
