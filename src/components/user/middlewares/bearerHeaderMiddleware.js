/**
 * Applies Bearer header for all requests
 *
 * @param {object} store - redux store
 * @param {function} store.getState
 *
 * @return {object} - request middleware
 */
export default function bearerHeaderMiddleware({getState}) {
    return {
        before(data) {
            const {token} = getState().user;

            if (token) {
                data.options.headers.Authorization = `Bearer ${token}`;
            }

            return data;
        }
    };
}
