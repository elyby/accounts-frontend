import { getJwtPayloads } from 'app/functions';
import { sessionStorage } from 'app/services/localStorage';
import {
  validateToken,
  requestToken,
  logout,
} from 'app/services/api/authentication';
import {
  relogin as navigateToLogin,
  setAccountSwitcher,
} from 'app/components/auth/actions';
import { updateUser, setGuest } from 'app/components/user/actions';
import { setLocale } from 'app/components/i18n/actions';
import logger from 'app/services/logger';
import { ThunkAction } from 'app/reducers';

import { getActiveAccount, Account } from './reducer';
import {
  add,
  remove,
  activate,
  reset,
  updateToken,
} from './actions/pure-actions';

export { updateToken, activate, remove };

/**
 * @param {Account|object} account
 * @param {string} account.token
 * @param {string} account.refreshToken
 *
 * @returns {Function}
 */
export function authenticate(
  account:
    | Account
    | {
        token: string;
        refreshToken: string | null;
      },
): ThunkAction<Promise<Account>> {
  const { token, refreshToken } = account;
  const email = 'email' in account ? account.email : null;

  return async (dispatch, getState) => {
    let accountId: number;

    if ('id' in account && typeof account.id === 'number') {
      accountId = account.id;
    } else {
      accountId = findAccountIdFromToken(token);
    }

    const knownAccount = getState().accounts.available.find(
      (item) => item.id === accountId,
    );

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
      const { auth } = getState();
      const newAccount: Account = {
        id: user.id,
        username: user.username,
        email: user.email,
        token: newToken,
        refreshToken: newRefreshToken,
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

      if (auth && auth.oauth && auth.oauth.clientId) {
        // if we authenticating during oauth, we disable account chooser
        // because user probably has made his choise now
        // this may happen, when user registers, logs in or uses account
        // chooser panel during oauth
        dispatch(setAccountSwitcher(false));
      }

      await dispatch(setLocale(user.lang));

      return newAccount;
    } catch (resp) {
      // all the logic to get the valid token was failed,
      // looks like we have some problems with token
      // lets redirect to login page
      if (typeof email === 'string') {
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
export function refreshUserData(): ThunkAction<Promise<void>> {
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
 * Checks the current user's token exp time. Supposed to be used before performing
 * any api request
 *
 * @see components/user/middlewares/refreshTokenMiddleware
 *
 * @returns {Function}
 */
export function ensureToken(): ThunkAction<Promise<void>> {
  return (dispatch, getState) => {
    const { token } = getActiveAccount(getState()) || {};

    try {
      const SAFETY_FACTOR = 300; // ask new token earlier to overcome time desynchronization problem
      const { exp } = getJwtPayloads(token as any);

      if (exp - SAFETY_FACTOR < Date.now() / 1000) {
        return dispatch(requestNewToken());
      }
    } catch (err) {
      logger.warn('Refresh token error: bad token', {
        token,
      });

      dispatch(relogin());

      return Promise.reject(new Error('Invalid token'));
    }

    return Promise.resolve();
  };
}

/**
 * Checks whether request `error` is an auth error and tries recover from it by
 * requesting a new auth token
 *
 * @see components/user/middlewares/refreshTokenMiddleware
 *
 * @param  {object} error
 *
 * @returns {Function}
 */
export function recoverFromTokenError(
  error: {
    status: number;
    message: string;
  } | void,
): ThunkAction<Promise<void>> {
  return (dispatch, getState) => {
    if (error && error.status === 401) {
      const activeAccount = getActiveAccount(getState());

      if (activeAccount && activeAccount.refreshToken) {
        if (
          [
            'Token expired',
            'Incorrect token',
            'You are requesting with an invalid credential.',
          ].includes(error.message)
        ) {
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
    }

    return Promise.reject(error);
  };
}

/**
 * Requests new token and updates state. In case, when token can not be updated,
 * it will redirect user to login page
 *
 * @returns {Function}
 */
export function requestNewToken(): ThunkAction<Promise<void>> {
  return (dispatch, getState) => {
    const { refreshToken } = getActiveAccount(getState()) || {};

    if (!refreshToken) {
      dispatch(relogin());

      return Promise.resolve();
    }

    return requestToken(refreshToken)
      .then((token) => {
        dispatch(updateToken(token));
      })
      .catch((resp) => {
        // all the logic to get the valid token was failed,
        // looks like we have some problems with token
        // lets redirect to login page
        dispatch(relogin());

        return Promise.reject(resp);
      });
  };
}

/**
 * Remove one account from current user's account list
 *
 * @param {Account} account
 *
 * @returns {Function}
 */
export function revoke(account: Account): ThunkAction<Promise<void>> {
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

export function relogin(email?: string): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const activeAccount = getActiveAccount(getState());

    if (!email && activeAccount) {
      email = activeAccount.email;
    }

    dispatch(navigateToLogin(email || null));
  };
}

export function logoutAll(): ThunkAction<Promise<void>> {
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
 *
 * @returns {Function}
 */
export function logoutStrangers(): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const {
      accounts: { available },
    } = getState();
    const activeAccount = getActiveAccount(getState());

    const isStranger = ({ refreshToken, id }: Account) =>
      !refreshToken && !sessionStorage.getItem(`stranger${id}`);

    if (available.some(isStranger)) {
      const accountToReplace = available.find(
        (account) => !isStranger(account),
      );

      if (accountToReplace) {
        available.filter(isStranger).forEach((account) => {
          dispatch(remove(account));
          logout(account.token);
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
