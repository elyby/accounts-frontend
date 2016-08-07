import { authenticate, changeLang } from 'components/user/actions';

import request from 'services/request';
import bearerHeaderMiddleware from './middlewares/bearerHeaderMiddleware';
import refreshTokenMiddleware from './middlewares/refreshTokenMiddleware';

/**
 * Initializes User state with the fresh data
 *
 * @param {object} store - redux store
 *
 * @return {Promise} - a promise, that resolves in User state
 */
export function factory(store) {
    request.addMiddleware(refreshTokenMiddleware(store));
    request.addMiddleware(bearerHeaderMiddleware(store));

    return new Promise((resolve, reject) => {
        const {user} = store.getState();

        if (user.token) {
            // authorizing user if it is possible
            return store.dispatch(authenticate(user.token)).then(resolve, reject);
        }

        // auto-detect guests language
        store.dispatch(changeLang(user.lang)).then(resolve, reject);
    });
}
