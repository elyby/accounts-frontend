import authentication from 'services/api/authentication';
import logger from 'services/logger';
import { updateToken, logoutAll } from 'components/accounts/actions';

/**
 * Ensures, that all user's requests have fresh access token
 *
 * @param {object} store - redux store
 * @param {function} store.getState
 * @param {function} store.dispatch
 *
 * @return {object} - request middleware
 */
export default function refreshTokenMiddleware({dispatch, getState}) {
    return {
        before(req) {
            const {user, accounts} = getState();

            let refreshToken;
            let token;

            const isRefreshTokenRequest = req.url.includes('refresh-token');

            if (accounts.active) {
                token = accounts.active.token;
                refreshToken = accounts.active.refreshToken;
            } else { // #legacy token
                token = user.token;
                refreshToken = user.refreshToken;
            }

            if (!token || req.options.token || isRefreshTokenRequest) {
                return req;
            }

            try {
                const SAFETY_FACTOR = 300; // ask new token earlier to overcome time dissynchronization problem
                const jwt = getJWTPayload(token);

                if (jwt.exp - SAFETY_FACTOR < Date.now() / 1000) {
                    return requestAccessToken(refreshToken, dispatch).then(() => req);
                }
            } catch (err) {
                logger.warn('Refresh token error: bad token', {
                    token
                });

                return dispatch(logoutAll()).then(() => req);
            }

            return Promise.resolve(req);
        },

        catch(resp, req, restart) {
            if (resp && resp.status === 401 && !req.options.token) {
                const {user, accounts} = getState();
                const {refreshToken} = accounts.active ? accounts.active : user;

                if (resp.message === 'Token expired' && refreshToken) {
                    // request token and retry
                    return requestAccessToken(refreshToken, dispatch).then(restart);
                }

                return dispatch(logoutAll()).then(() => Promise.reject(resp));
            }

            return Promise.reject(resp);
        }
    };
}

function requestAccessToken(refreshToken, dispatch) {
    let promise;
    if (refreshToken) {
        promise = authentication.requestToken(refreshToken);
    } else {
        promise = Promise.reject();
    }

    return promise
        .then(({token}) => dispatch(updateToken(token)))
        .catch(() => dispatch(logoutAll()));
}


function getJWTPayload(jwt) {
    const parts = (jwt || '').split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid jwt token');
    }

    try {
        return JSON.parse(atob(parts[1]));
    } catch (err) {
        throw new Error('Can not decode jwt token');
    }
}
