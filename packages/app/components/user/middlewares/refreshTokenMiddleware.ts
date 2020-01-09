import {
  ensureToken,
  recoverFromTokenError,
} from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { Store } from 'app/reducers';
import { Middleware } from 'app/services/request';

/**
 * Ensures, that all user's requests have fresh access token
 *
 * @param {object} store - redux store
 * @param {Function} store.getState
 * @param {Function} store.dispatch
 *
 * @returns {object} - request middleware
 */
export default function refreshTokenMiddleware({
  dispatch,
  getState,
}: Store): Middleware {
  return {
    async before(req) {
      const activeAccount = getActiveAccount(getState());
      const disableMiddleware =
        !!req.options.token || req.options.token === null;

      const isRefreshTokenRequest = req.url.includes('refresh-token');

      if (!activeAccount || disableMiddleware || isRefreshTokenRequest) {
        return Promise.resolve(req);
      }

      return dispatch(ensureToken()).then(() => req);
    },

    async catch(
      resp: { status: number; message: string },
      req,
      restart,
    ): Promise<any> {
      const disableMiddleware =
        !!req.options.token || req.options.token === null;

      if (disableMiddleware) {
        return Promise.reject(resp);
      }

      return dispatch(recoverFromTokenError(resp)).then(restart);
    },
  };
}
