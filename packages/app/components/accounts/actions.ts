import * as Sentry from '@sentry/react';
import { getJwtPayloads } from 'app/functions';
import { sessionStorage } from 'app/services/localStorage';
import { validateToken, requestToken, logout } from 'app/services/api/authentication';
import { relogin as navigateToLogin } from 'app/components/auth/actions';
import { updateUser, setGuest } from 'app/components/user/actions';
import { setLocale } from 'app/components/i18n/actions';
import logger from 'app/services/logger';
import { ApiError, UnauthorizedError } from 'app/services/request';
import { Action as AppAction } from 'app/types';

import { getActiveAccount, Account } from './reducer';
import { add, remove, activate, reset, updateToken } from './actions/pure-actions';

export { updateToken, activate, remove };

export function authenticate(
    account:
        | Account
        | {
              token: string;
              refreshToken: string | null;
          },
): AppAction<Promise<Account>> {
    const { token, refreshToken } = account;
    const email = 'email' in account ? account.email : null;

    return async (dispatch, getState) => {
        let accountId: number;

        if ('id' in account && typeof account.id === 'number') {
            accountId = account.id;
        } else {
            accountId = findAccountIdFromToken(token);
        }

        const knownAccount = getState().accounts.available.find((item) => item.id === accountId);

        if (knownAccount) {
            // this account is already available
            // activate it before validation
            dispatch(activate(knownAccount));
        }

        try {
            const {
                token: newToken,
                refreshToken: newRefreshToken,
                user,
            } = await validateToken(accountId, token, refreshToken);
            const newAccount: Account = {
                id: user.id,
                username: user.username,
                email: user.email,
                token: newToken,
                refreshToken: newRefreshToken,
                isDeleted: user.isDeleted,
            };
            dispatch(add(newAccount));
            dispatch(activate(newAccount));
            dispatch(
                updateUser({
                    isGuest: false,
                    ...user,
                }),
            );

            // TODO: probably should be moved from here, because it is a side effect
            logger.setUser(user);

            if (!newRefreshToken) {
                // mark user as stranger (user does not want us to remember his account)
                sessionStorage.setItem(`stranger${newAccount.id}`, '1');
            }

            await dispatch(setLocale(user.lang));

            return newAccount;
        } catch (resp) {
            // Log out only when the backend has explicitly rejected the credentials.
            // Server errors and unexpected responses are shown as BSoD (see bsodErrorListener)
            // and, like the network errors, must not lose the user's session
            if (typeof email === 'string' && resp instanceof ApiError) {
                // TODO: we should somehow try to find email by token
                dispatch(relogin(email));
            }

            throw resp;
        }
    };
}

/**
 * Re-fetch user data for currently active account
 */
export function refreshUserData(): AppAction<Promise<void>> {
    return async (dispatch, getState) => {
        const activeAccount = getActiveAccount(getState());

        if (!activeAccount) {
            throw new Error('Can not fetch user data. No user.id available');
        }

        await dispatch(authenticate(activeAccount));
    };
}

function findAccountIdFromToken(token: string): number {
    const { sub, jti } = getJwtPayloads(token);

    // sub has the format "ely|{accountId}", so we must trim "ely|" part
    if (sub) {
        return parseInt(sub.substr(4), 10);
    }

    // In older backend versions identity was stored in jti claim. Some users still have such tokens
    if (jti) {
        return jti;
    }

    throw new Error('payloads is not contains any identity claim');
}

/**
 * Checks the current user's token exp time.
 * Supposed to be used before performing any api request
 *
 * @see components/user/authHooks
 */
export function ensureToken(): AppAction<Promise<void>> {
    return (dispatch, getState) => {
        const { token } = getActiveAccount(getState()) || {};

        try {
            const SAFETY_FACTOR = 300; // ask new token earlier to overcome time desynchronization problem
            const { exp } = getJwtPayloads(token as any);

            if (exp - SAFETY_FACTOR < Date.now() / 1000) {
                return dispatch(requestNewToken());
            }
        } catch {
            // There is might be an exception only if getJwtPayloads() will fail to parse the token,
            // so handle it like the expired token
            return dispatch(requestNewToken());
        }

        return Promise.resolve();
    };
}

/**
 * Tries to recover from the rejected access token by requesting a new one.
 * Logs the user out, when it's impossible
 *
 * @see components/user/authHooks
 */
export function recoverFromTokenError(error: UnauthorizedError): AppAction<Promise<void>> {
    return (dispatch, getState) => {
        const activeAccount = getActiveAccount(getState());

        if (activeAccount && activeAccount.refreshToken) {
            if (error.isRecoverable) {
                // request token and retry
                return dispatch(requestNewToken());
            }

            logger.error('Unknown unauthorized response', {
                error,
            });
        }

        // user's access token is outdated and we have no refreshToken
        // or something unexpected happend
        // in both cases we resetting all the user's state
        dispatch(relogin());

        return Promise.reject(error);
    };
}

// Concurrent requests with an expired token share a single refresh request instead of sending one each
const pendingTokenRequests = new Map<string, Promise<void>>();

/**
 * Requests new token and updates state. In case, when token can not be updated,
 * it will redirect user to login page
 * @returns {Function}
 */
export function requestNewToken(): AppAction<Promise<void>> {
    return (dispatch, getState) => {
        const { refreshToken } = getActiveAccount(getState()) || {};

        if (!refreshToken) {
            dispatch(relogin());

            return Promise.resolve();
        }

        const pending = pendingTokenRequests.get(refreshToken);

        if (pending) {
            return pending;
        }

        // The span is started synchronously, while the request, that needs the token, is active (see authHooks).
        // It must be passed explicitly: by default the browser SDK attaches the new spans to the root one
        const spanOptions = {
            name: 'Refresh access token',
            op: 'auth.token.refresh',
            parentSpan: Sentry.getActiveSpan(),
        };
        const promise = Sentry.startSpan(spanOptions, () => requestToken(refreshToken))
            .then((token) => {
                dispatch(updateToken(token));
            })
            .catch((resp) => {
                // Log out only when the backend has explicitly rejected the refresh token.
                // Server errors and unexpected responses are shown as BSoD (see bsodErrorListener)
                // and, like the network errors, must not lose the user's session
                if (resp instanceof ApiError) {
                    dispatch(relogin());
                }

                return Promise.reject(resp);
            })
            .finally(() => {
                pendingTokenRequests.delete(refreshToken);
            });

        pendingTokenRequests.set(refreshToken, promise);

        return promise;
    };
}

/**
 * Remove one account from current user's account list
 * @param {Account} account
 * @returns {Function}
 */
export function revoke(account: Account): AppAction<Promise<void>> {
    return async (dispatch, getState) => {
        const accountToReplace: Account | null =
            getState().accounts.available.find(({ id }) => id !== account.id) || null;

        if (accountToReplace) {
            await dispatch(authenticate(accountToReplace))
                .finally(() => {
                    // we need to logout user, even in case, when we can
                    // not authenticate him with new account
                    logout(account.token).catch(() => {
                        // we don't care
                    });
                    dispatch(remove(account));
                })
                .catch(() => {
                    // we don't care
                });

            return;
        }

        return dispatch(logoutAll());
    };
}

export function relogin(email?: string): AppAction<Promise<void>> {
    return async (dispatch, getState) => {
        const activeAccount = getActiveAccount(getState());

        if (!email && activeAccount) {
            email = activeAccount.email;
        }

        dispatch(navigateToLogin(email || null));
    };
}

export function logoutAll(): AppAction<Promise<void>> {
    return (dispatch, getState) => {
        dispatch(setGuest());

        const {
            accounts: { available },
        } = getState();

        available.forEach((account) =>
            logout(account.token).catch(() => {
                // we don't care
            }),
        );

        dispatch(reset());
        dispatch(relogin());

        return Promise.resolve();
    };
}

/**
 * Logouts accounts, that was marked as "do not remember me"
 *
 * We detecting foreign accounts by the absence of refreshToken. The account
 * won't be removed, until key `stranger${account.id}` is present in sessionStorage
 * @returns {Function}
 */
export function logoutStrangers(): AppAction<Promise<void>> {
    return async (dispatch, getState) => {
        const {
            accounts: { available },
        } = getState();
        const activeAccount = getActiveAccount(getState());

        const isStranger = ({ refreshToken, id }: Account) => !refreshToken && !sessionStorage.getItem(`stranger${id}`);

        if (available.some(isStranger)) {
            const accountToReplace = available.find((account) => !isStranger(account));

            if (accountToReplace) {
                available.filter(isStranger).forEach((account) => {
                    dispatch(remove(account));
                    logout(account.token).catch(() => {
                        // we don't care: the token might be already expired
                    });
                });

                if (activeAccount && isStranger(activeAccount)) {
                    await dispatch(authenticate(accountToReplace));

                    return;
                }
            } else {
                await dispatch(logoutAll());

                return;
            }
        }

        return Promise.resolve();
    };
}
