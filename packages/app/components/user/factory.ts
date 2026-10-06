import { authenticate, logoutStrangers } from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { addHooks } from 'app/services/request';
import { Store } from 'app/types';

import { changeLang } from './actions';
import createAuthHooks from './authHooks';

let promise: Promise<void>;

/**
 * Initializes User state with the fresh data
 *
 * @param {object} store - redux store
 *
 * @returns {Promise<User>} - a promise, that resolves in User state
 */
export function factory(store: Store): Promise<void> {
    if (promise) {
        return promise;
    }

    addHooks(createAuthHooks(store));

    promise = Promise.resolve()
        .then(() => store.dispatch(logoutStrangers()))
        .then(async () => {
            const activeAccount = getActiveAccount(store.getState());

            if (activeAccount) {
                // authorizing user if it is possible
                await store.dispatch(authenticate(activeAccount));

                return;
            }

            throw new Error('No active account found');
        })
        .catch(async () => {
            // the user is guest or user authentication failed
            const { user } = store.getState();

            // auto-detect guest language
            await store.dispatch(changeLang(user.lang));
        });

    return promise;
}
