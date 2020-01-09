import { authenticate, logoutStrangers } from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import request from 'app/services/request';
import { Store } from 'app/reducers';

import { changeLang } from './actions';
import bearerHeaderMiddleware from './middlewares/bearerHeaderMiddleware';
import refreshTokenMiddleware from './middlewares/refreshTokenMiddleware';

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

  request.addMiddleware(refreshTokenMiddleware(store));
  request.addMiddleware(bearerHeaderMiddleware(store));

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
