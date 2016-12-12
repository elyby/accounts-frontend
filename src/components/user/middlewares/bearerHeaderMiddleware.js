/**
 * Applies Bearer header for all requests
 *
 * req.options.token is used to override current token.
 * Pass null to disable bearer header at all
 *
 * @param {object} store - redux store
 * @param {function} store.getState
 *
 * @return {object} - request middleware
 */
export default function bearerHeaderMiddleware({getState}) {
    return {
        before(req) {
            const {user, accounts} = getState();

            let {token} = accounts.active ? accounts.active : user;

            if (req.options.token || req.options.token === null) {
                token = req.options.token;
            }

            if (token) {
                req.options.headers.Authorization = `Bearer ${token}`;
            }

            return req;
        }
    };
}
