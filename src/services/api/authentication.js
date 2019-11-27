// @flow
import type { UserResponse } from 'services/api/accounts';
import logger from 'services/logger';
import request, { InternalServerError } from 'services/request';
import { getInfo as getInfoEndpoint } from 'services/api/accounts';

export interface OAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // count seconds before expire
  success: true;
}

export function login({
  login,
  password,
  totp,
  rememberMe = false,
}: {
  login: string,
  password?: string,
  totp?: string,
  rememberMe: boolean,
}): Promise<OAuthResponse> {
  return request.post(
    '/api/authentication/login',
    {
      login,
      password,
      totp,
      rememberMe,
    },
    { token: null },
  );
}

/**
 * @param {string} token - an optional token to overwrite headers
 *                         in middleware and disable token auto-refresh
 *
 * @returns {Promise}
 */
export function logout(token?: string): Promise<{ success: boolean }> {
  return request.post(
    '/api/authentication/logout',
    {},
    {
      token,
    },
  );
}

export function forgotPassword(
  login: string,
  captcha: string,
): Promise<{
  success: boolean,
  data: {
    canRepeatIn: number,
    emailMask: ?string,
    repeatFrequency: number,
  },
  errors: {
    [key: string]: string,
  },
}> {
  return request.post(
    '/api/authentication/forgot-password',
    {
      login,
      captcha,
    },
    { token: null },
  );
}

export function recoverPassword(
  key: string,
  newPassword: string,
  newRePassword: string,
): Promise<OAuthResponse> {
  return request.post(
    '/api/authentication/recover-password',
    {
      key,
      newPassword,
      newRePassword,
    },
    { token: null },
  );
}

/**
 * Resolves if token is valid
 *
 * @param {number} id
 * @param {string} token
 * @param {string} refreshToken
 *
 * @returns {Promise} - resolves with options.token or with a new token
 *                     if it was refreshed. As a side effect the response
 *                     will have a `user` field with current user data
 *
 */
export async function validateToken(
  id: number,
  token: string,
  refreshToken: ?string,
): Promise<{
  token: string,
  refreshToken: ?string,
  user: UserResponse,
}> {
  if (typeof token !== 'string') {
    throw new Error('token must be a string');
  }

  let user: UserResponse;
  try {
    user = await getInfoEndpoint(id, token);
  } catch (resp) {
    token = await handleTokenError(resp, refreshToken);
    user = await getInfoEndpoint(id, token); // TODO: replace with recursive call
  }

  return {
    token,
    refreshToken,
    user,
  };
}

const recoverableErrors = [
  'Token expired',
  'Incorrect token',
  'You are requesting with an invalid credential.',
];

function handleTokenError(
  resp: Error | { message: string },
  refreshToken: ?string,
): Promise<string> {
  if (resp instanceof InternalServerError) {
    // delegate error recovering to the bsod middleware
    return new Promise(() => {});
  }

  if (refreshToken) {
    if (recoverableErrors.includes(resp.message)) {
      return requestToken(refreshToken);
    }

    logger.error('Unexpected error during token validation', { resp });
  }

  return Promise.reject(resp);
}

/**
 * Request new access token using a refreshToken
 *
 * @param {string} refreshToken
 *
 * @returns {Promise} - resolves to token
 */
export async function requestToken(refreshToken: string): Promise<string> {
  try {
    const response: OAuthResponse = await request.post(
      '/api/authentication/refresh-token',
      {
        refresh_token: refreshToken, // eslint-disable-line camelcase
      },
      {
        token: null,
      },
    );

    return response.access_token;
  } catch (resp) {
    const errors = resp.errors || {};

    if (errors.refresh_token !== 'error.refresh_token_not_exist') {
      logger.error('Failed refreshing token: unknown error', {
        resp,
      });
    }

    throw resp;
  }
}
