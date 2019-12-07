import { browserHistory } from 'app/services/history';
import logger from 'app/services/logger';
import localStorage from 'app/services/localStorage';
import loader from 'app/services/loader';
import history from 'app/services/history';
import {
  updateUser,
  acceptRules as userAcceptRules,
} from 'app/components/user/actions';
import { authenticate, logoutAll } from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import {
  login as loginEndpoint,
  forgotPassword as forgotPasswordEndpoint,
  recoverPassword as recoverPasswordEndpoint,
  OAuthResponse,
} from 'app/services/api/authentication';
import oauth, { OauthData, Client, Scope } from 'app/services/api/oauth';
import signup from 'app/services/api/signup';
import dispatchBsod from 'app/components/ui/bsod/dispatchBsod';
import { create as createPopup } from 'app/components/ui/popup/actions';
import ContactForm from 'app/components/contact/ContactForm';
import { ThunkAction, Dispatch } from 'app/reducers';

import { getCredentials } from './reducer';

type ValidationError =
  | string
  | {
      type: string;
      payload: { [key: string]: any };
    };

export { updateUser } from 'app/components/user/actions';
export {
  authenticate,
  logoutAll as logout,
  remove as removeAccount,
  activate as activateAccount,
} from 'app/components/accounts/actions';
import { Account } from 'app/components/accounts/reducer';

/**
 * Reoutes user to the previous page if it is possible
 *
 * @param {object} options
 * @param {string} options.fallbackUrl - an url to route user to if goBack is not possible
 *
 * @returns {object} - action definition
 */
export function goBack(options: { fallbackUrl?: string }) {
  const { fallbackUrl } = options || {};

  if (history.canGoBack()) {
    browserHistory.goBack();
  } else if (fallbackUrl) {
    browserHistory.push(fallbackUrl);
  }

  return {
    type: 'noop',
  };
}

export function redirect(url: string): () => Promise<void> {
  loader.show();

  return () =>
    new Promise(() => {
      // do not resolve promise to make loader visible and
      // overcome app rendering
      location.href = url;
    });
}

const PASSWORD_REQUIRED = 'error.password_required';
const LOGIN_REQUIRED = 'error.login_required';
const ACTIVATION_REQUIRED = 'error.account_not_activated';
const TOTP_REQUIRED = 'error.totp_required';

export function login({
  login = '',
  password = '',
  totp,
  rememberMe = false,
}: {
  login: string;
  password?: string;
  totp?: string;
  rememberMe?: boolean;
}) {
  return wrapInLoader(dispatch =>
    loginEndpoint({ login, password, totp, rememberMe })
      .then(authHandler(dispatch))
      .catch(resp => {
        if (resp.errors) {
          if (resp.errors.password === PASSWORD_REQUIRED) {
            return dispatch(setLogin(login));
          } else if (resp.errors.login === ACTIVATION_REQUIRED) {
            return dispatch(needActivation());
          } else if (resp.errors.totp === TOTP_REQUIRED) {
            return dispatch(
              requestTotp({
                login,
                password,
                rememberMe,
              }),
            );
          } else if (resp.errors.login === LOGIN_REQUIRED && password) {
            logger.warn('No login on password panel');

            return dispatch(logoutAll());
          }
        }

        return Promise.reject(resp);
      })
      .catch(validationErrorsHandler(dispatch)),
  );
}

export function acceptRules() {
  return wrapInLoader(dispatch =>
    dispatch(userAcceptRules()).catch(validationErrorsHandler(dispatch)),
  );
}

export function forgotPassword({
  login = '',
  captcha = '',
}: {
  login: string;
  captcha: string;
}) {
  return wrapInLoader((dispatch, getState) =>
    forgotPasswordEndpoint(login, captcha)
      .then(({ data = {} }) =>
        dispatch(
          updateUser({
            maskedEmail: data.emailMask || getState().user.email,
          }),
        ),
      )
      .catch(validationErrorsHandler(dispatch)),
  );
}

export function recoverPassword({
  key = '',
  newPassword = '',
  newRePassword = '',
}: {
  key: string;
  newPassword: string;
  newRePassword: string;
}) {
  return wrapInLoader(dispatch =>
    recoverPasswordEndpoint(key, newPassword, newRePassword)
      .then(authHandler(dispatch))
      .catch(validationErrorsHandler(dispatch, '/forgot-password')),
  );
}

export function register({
  email = '',
  username = '',
  password = '',
  rePassword = '',
  captcha = '',
  rulesAgreement = false,
}: {
  email: string;
  username: string;
  password: string;
  rePassword: string;
  captcha: string;
  rulesAgreement: boolean;
}) {
  return wrapInLoader((dispatch, getState) =>
    signup
      .register({
        email,
        username,
        password,
        rePassword,
        rulesAgreement,
        lang: getState().user.lang,
        captcha,
      })
      .then(() => {
        dispatch(
          updateUser({
            username,
            email,
          }),
        );

        dispatch(needActivation());

        browserHistory.push('/activation');
      })
      .catch(validationErrorsHandler(dispatch)),
  );
}

export function activate({
  key = '',
}: {
  key: string;
}): ThunkAction<Promise<Account>> {
  return wrapInLoader(dispatch =>
    signup
      .activate({ key })
      .then(authHandler(dispatch))
      .catch(validationErrorsHandler(dispatch, '/resend-activation')),
  );
}

export function resendActivation({
  email = '',
  captcha,
}: {
  email: string;
  captcha: string;
}) {
  return wrapInLoader(dispatch =>
    signup
      .resendActivation({ email, captcha })
      .then(resp => {
        dispatch(
          updateUser({
            email,
          }),
        );

        return resp;
      })
      .catch(validationErrorsHandler(dispatch)),
  );
}

export function contactUs() {
  return createPopup({ Popup: ContactForm });
}

export const SET_CREDENTIALS = 'auth:setCredentials';
/**
 * Sets login in credentials state
 *
 * Resets the state, when `null` is passed
 *
 * @param {string|null} login
 *
 * @returns {object}
 */
export function setLogin(login: string | null) {
  return {
    type: SET_CREDENTIALS,
    payload: login
      ? {
          login,
        }
      : null,
  };
}

export function relogin(login: string | null): ThunkAction {
  return (dispatch, getState) => {
    const credentials = getCredentials(getState());
    const returnUrl =
      credentials.returnUrl || location.pathname + location.search;

    dispatch({
      type: SET_CREDENTIALS,
      payload: {
        login,
        returnUrl,
        isRelogin: true,
      },
    });

    browserHistory.push('/login');
  };
}

function requestTotp({
  login,
  password,
  rememberMe,
}: {
  login: string;
  password: string;
  rememberMe: boolean;
}): ThunkAction {
  return (dispatch, getState) => {
    // merging with current credentials to propogate returnUrl
    const credentials = getCredentials(getState());

    dispatch({
      type: SET_CREDENTIALS,
      payload: {
        ...credentials,
        login,
        password,
        rememberMe,
        isTotpRequired: true,
      },
    });
  };
}

export const SET_SWITCHER = 'auth:setAccountSwitcher';
export function setAccountSwitcher(isOn: boolean) {
  return {
    type: SET_SWITCHER,
    payload: isOn,
  };
}

export const ERROR = 'auth:error';
export function setErrors(errors: { [key: string]: ValidationError } | null) {
  return {
    type: ERROR,
    payload: errors,
    error: true,
  };
}

export function clearErrors() {
  return setErrors(null);
}

const KNOWN_SCOPES = [
  'minecraft_server_session',
  'offline_access',
  'account_info',
  'account_email',
];
/**
 * @param {object} oauthData
 * @param {string} oauthData.clientId
 * @param {string} oauthData.redirectUrl
 * @param {string} oauthData.responseType
 * @param {string} oauthData.description
 * @param {string} oauthData.scope
 * @param {string} [oauthData.prompt='none'] - comma-separated list of values to adjust auth flow
 *                 Posible values:
 *                  * none - default behaviour
 *                  * consent - forcibly prompt user for rules acceptance
 *                  * select_account - force account choosage, even if user has only one
 * @param {string} oauthData.loginHint - allows to choose the account, which will be used for auth
 *                        The possible values: account id, email, username
 * @param {string} oauthData.state
 *
 * @returns {Promise}
 */
export function oAuthValidate(oauthData: OauthData) {
  // TODO: move to oAuth actions?
  // test request: /oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session&description=foo
  return wrapInLoader(dispatch =>
    oauth
      .validate(oauthData)
      .then(resp => {
        const { scopes } = resp.session;
        const invalidScopes = scopes.filter(
          scope => !KNOWN_SCOPES.includes(scope),
        );
        let prompt = (oauthData.prompt || 'none')
          .split(',')
          .map(item => item.trim());

        if (prompt.includes('none')) {
          prompt = ['none'];
        }

        if (invalidScopes.length) {
          logger.error('Got invalid scopes after oauth validation', {
            invalidScopes,
          });
        }

        dispatch(setClient(resp.client));
        dispatch(
          setOAuthRequest({
            ...resp.oAuth,
            prompt: oauthData.prompt || 'none',
            loginHint: oauthData.loginHint,
          }),
        );
        dispatch(setScopes(scopes));
        localStorage.setItem(
          'oauthData',
          JSON.stringify({
            // @see services/authFlow/AuthFlow
            timestamp: Date.now(),
            payload: oauthData,
          }),
        );
      })
      .catch(handleOauthParamsValidation),
  );
}

/**
 * @param {object} params
 * @param {bool} params.accept=false
 *
 * @returns {Promise}
 */
export function oAuthComplete(params: { accept?: boolean } = {}) {
  return wrapInLoader(
    async (
      dispatch,
      getState,
    ): Promise<{
      success: boolean;
      redirectUri: string;
    }> => {
      const oauthData = getState().auth.oauth;

      if (!oauthData) {
        throw new Error('Can not complete oAuth. Oauth data does not exist');
      }

      try {
        const resp = await oauth.complete(oauthData, params);
        localStorage.removeItem('oauthData');

        if (resp.redirectUri.startsWith('static_page')) {
          const displayCode = resp.redirectUri === 'static_page_with_code';

          const [, code] = resp.redirectUri.match(/code=(.+)&/) || [];
          [, resp.redirectUri] = resp.redirectUri.match(/^(.+)\?/) || [];

          dispatch(
            setOAuthCode({
              success: resp.success,
              code,
              displayCode,
            }),
          );
        }

        return resp;
      } catch (error) {
        const resp:
          | {
              acceptRequired: boolean;
            }
          | {
              unauthorized: boolean;
            } = error;

        if ('acceptRequired' in resp) {
          dispatch(requirePermissionsAccept());

          return Promise.reject(resp);
        }

        return handleOauthParamsValidation(resp);
      }
    },
  );
}

function handleOauthParamsValidation(
  resp: {
    [key: string]: any;
    userMessage?: string;
  } = {},
) {
  dispatchBsod();
  localStorage.removeItem('oauthData');

  // eslint-disable-next-line no-alert
  resp.userMessage && setTimeout(() => alert(resp.userMessage), 500); // 500 ms to allow re-render

  return Promise.reject(resp);
}

export const SET_CLIENT = 'set_client';
export function setClient({ id, name, description }: Client) {
  return {
    type: SET_CLIENT,
    payload: { id, name, description },
  };
}

export function resetOAuth(): ThunkAction {
  return (dispatch): void => {
    localStorage.removeItem('oauthData');
    dispatch(setOAuthRequest({}));
  };
}

/**
 * Resets all temporary state related to auth
 */
export function resetAuth(): ThunkAction {
  return (dispatch, getSate): Promise<void> => {
    dispatch(setLogin(null));
    dispatch(resetOAuth());
    // ensure current account is valid
    const activeAccount = getActiveAccount(getSate());

    if (activeAccount) {
      return Promise.resolve(dispatch(authenticate(activeAccount)))
        .then(() => {})
        .catch(() => {
          // its okay. user will be redirected to an appropriate place
        });
    }

    return Promise.resolve();
  };
}

export const SET_OAUTH = 'set_oauth';
export function setOAuthRequest(oauth: {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  scope?: string;
  prompt?: string;
  loginHint?: string;
  state?: string;
}) {
  return {
    type: SET_OAUTH,
    payload: {
      clientId: oauth.client_id,
      redirectUrl: oauth.redirect_uri,
      responseType: oauth.response_type,
      scope: oauth.scope,
      prompt: oauth.prompt,
      loginHint: oauth.loginHint,
      state: oauth.state,
    },
  };
}

export const SET_OAUTH_RESULT = 'set_oauth_result';
export function setOAuthCode(oauth: {
  success: boolean;
  code: string;
  displayCode: boolean;
}) {
  return {
    type: SET_OAUTH_RESULT,
    payload: {
      success: oauth.success,
      code: oauth.code,
      displayCode: oauth.displayCode,
    },
  };
}

export const REQUIRE_PERMISSIONS_ACCEPT = 'require_permissions_accept';
export function requirePermissionsAccept() {
  return {
    type: REQUIRE_PERMISSIONS_ACCEPT,
  };
}

export const SET_SCOPES = 'set_scopes';
export function setScopes(scopes: Scope[]) {
  if (!(scopes instanceof Array)) {
    throw new Error('Scopes must be array');
  }

  return {
    type: SET_SCOPES,
    payload: scopes,
  };
}

export const SET_LOADING_STATE = 'set_loading_state';
export function setLoadingState(isLoading: boolean) {
  return {
    type: SET_LOADING_STATE,
    payload: isLoading,
  };
}

function wrapInLoader<T>(fn: ThunkAction<Promise<T>>): ThunkAction<Promise<T>> {
  return (dispatch, getState) => {
    dispatch(setLoadingState(true));
    const endLoading = () => dispatch(setLoadingState(false));

    return fn(dispatch, getState, undefined).then(
      resp => {
        endLoading();

        return resp;
      },
      resp => {
        endLoading();

        return Promise.reject(resp);
      },
    );
  };
}

function needActivation() {
  return updateUser({
    isActive: false,
    isGuest: false,
  });
}

function authHandler(dispatch: Dispatch) {
  return (resp: OAuthResponse): Promise<Account> =>
    dispatch(
      authenticate({
        token: resp.access_token,
        refreshToken: resp.refresh_token || null,
      }),
    ).then(resp => {
      dispatch(setLogin(null));

      return resp;
    });
}

function validationErrorsHandler(dispatch: Dispatch, repeatUrl?: string) {
  return resp => {
    if (resp.errors) {
      const firstError = Object.keys(resp.errors)[0];
      const error = {
        type: resp.errors[firstError],
        payload: {
          isGuest: true,
          repeatUrl: '',
        },
      };

      if (resp.data) {
        // TODO: this should be formatted on backend
        Object.assign(error.payload, resp.data);
      }

      if (
        ['error.key_not_exists', 'error.key_expire'].includes(error.type) &&
        repeatUrl
      ) {
        // TODO: this should be formatted on backend
        error.payload.repeatUrl = repeatUrl;
      }

      resp.errors[firstError] = error;

      dispatch(setErrors(resp.errors));
    }

    return Promise.reject(resp);
  };
}
