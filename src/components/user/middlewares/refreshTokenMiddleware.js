// @flow
import { ensureToken, recoverFromTokenError } from 'components/accounts/actions';
import { getActiveAccount } from 'components/accounts/reducer';

/**
 * Ensures, that all user's requests have fresh access token
 *
 * @param {object} store - redux store
 * @param {function} store.getState
 * @param {function} store.dispatch
 *
 * @return {object} - request middleware
 */
export default function refreshTokenMiddleware({dispatch, getState}: {dispatch: (Object) => *, getState: () => Object}) {
    return {
        before<T: {options: {token?: string}, url: string}>(req: T): Promise<T> {
            const activeAccount = getActiveAccount(getState());
            const disableMiddleware = !!req.options.token || req.options.token === null;

            const isRefreshTokenRequest = req.url.includes('refresh-token');

            if (!activeAccount || disableMiddleware || isRefreshTokenRequest) {
                return Promise.resolve(req);
            }

            return dispatch(ensureToken()).then(() => req);
        },

        catch(resp: {status: number, message: string}, req: {options: { token?: string}}, restart: () => Promise<mixed>): Promise<*> {
            const disableMiddleware = !!req.options.token || req.options.token === null;

            if (disableMiddleware) {
                return Promise.reject(resp);
            }

            return dispatch(recoverFromTokenError(resp)).then(restart);
        }
    };
}
