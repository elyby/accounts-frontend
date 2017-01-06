import { getJwtPayload } from 'functions';
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
            const {accounts} = getState();

            let refreshToken;
            let token;

            const isRefreshTokenRequest = req.url.includes('refresh-token');

            if (accounts.active) {
                token = accounts.active.token;
                refreshToken = accounts.active.refreshToken;
            }

            if (!token || req.options.token || isRefreshTokenRequest) {
                return Promise.resolve(req);
            }

            try {
                const SAFETY_FACTOR = 300; // ask new token earlier to overcome time dissynchronization problem
                const jwt = getJwtPayload(token);

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
                const {accounts} = getState();
                const {refreshToken} = accounts.active || {};

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


