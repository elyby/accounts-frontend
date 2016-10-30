import authentication from 'services/api/authentication';
import {updateUser, logout} from '../actions';

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
            const {refreshToken, token} = getState().user;
            const isRefreshTokenRequest = req.url.includes('refresh-token');

            if (!token || isRefreshTokenRequest || req.options.autoRefreshToken === false) {
                return req;
            }

            try {
                const SAFETY_FACTOR = 60; // ask new token earlier to overcome time dissynchronization problem
                const jwt = getJWTPayload(token);

                if (jwt.exp - SAFETY_FACTOR < Date.now() / 1000) {
                    return requestAccessToken(refreshToken, dispatch).then(() => req);
                }
            } catch (err) {
                dispatch(logout());
            }

            return req;
        },

        catch(resp, req, restart) {
            if (resp && resp.status === 401 && req.options.autoRefreshToken !== false) {
                const {refreshToken} = getState().user;
                if (resp.message === 'Token expired' && refreshToken) {
                    // request token and retry
                    return requestAccessToken(refreshToken, dispatch).then(restart);
                }

                dispatch(logout());
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
        .then(({token}) => dispatch(updateUser({
            token
        })))
        .catch(() => dispatch(logout()));
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
