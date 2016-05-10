import { authenticate } from 'components/user/actions';

/**
 * Initializes User state with the fresh data
 *
 * @param  {Object} store - redux store
 *
 * @return {Promise} a promise, that resolves in User state
 */
export function factory(store) {
    const state = store.getState();

    return new Promise((resolve, reject) => {
        if (state.user.token) {
            // authorizing user if it is possible
            store.dispatch(authenticate(state.user.token))
                .then(() => resolve(store.getState().user), reject);
        } else {
            resolve(state.user);
        }
    });
}
