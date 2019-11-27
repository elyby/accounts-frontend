// @flow
import { getActiveAccount } from 'components/accounts/reducer';

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
export default function bearerHeaderMiddleware(store: {
  getState: () => Object,
}) {
  return {
    before<
      T: {
        options: {
          token?: ?string,
          headers: Object,
        },
      },
    >(req: T): T {
      const activeAccount = getActiveAccount(store.getState());

      let { token } = activeAccount || {};

      if (req.options.token || req.options.token === null) {
        token = req.options.token;
      }

      if (token) {
        req.options.headers.Authorization = `Bearer ${token}`;
      }

      return req;
    },
  };
}
