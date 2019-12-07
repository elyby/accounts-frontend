import { getActiveAccount } from 'app/components/accounts/reducer';
import { Store } from 'app/reducers';
import { Middleware } from 'app/services/request';

/**
 * Applies Bearer header for all requests
 *
 * req.options.token is used to override current token.
 * Pass null to disable bearer header at all
 *
 * @param {object} store - redux store
 * @param {Function} store.getState
 *
 * @returns {object} - request middleware
 */
export default function bearerHeaderMiddleware(store: Store): Middleware {
  return {
    async before(req) {
      const activeAccount = getActiveAccount(store.getState());

      let { token = null } = activeAccount || {};

      if (req.options.token || req.options.token === null) {
        ({ token } = req.options);
      }

      if (token) {
        req.options.headers.Authorization = `Bearer ${token}`;
      }

      return req;
    },
  };
}
