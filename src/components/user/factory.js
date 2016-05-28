import { authenticate, changeLang } from 'components/user/actions';

/**
 * Initializes User state with the fresh data
 *
 * @param  {Object} store - redux store
 *
 * @return {Promise} a promise, that resolves in User state
 */
export function factory(store) {
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
