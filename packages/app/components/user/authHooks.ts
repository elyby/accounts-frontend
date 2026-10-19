import * as Sentry from '@sentry/react';
import ky, { Hooks } from 'ky';

import { ensureToken, recoverFromTokenError } from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { RequestContext, UnauthorizedError, createResponseError } from 'app/services/request';
import { Store } from 'app/types';

const REFRESH_TOKEN_URL = '/api/authentication/refresh-token';

interface AuthRequestContext extends RequestContext {
    /**
     * Set before retrying the request with the refreshed token.
     * The context is shared by all the attempts of the request
     */
    isTokenRefreshed?: boolean;
}

/**
 * Creates ky hooks, that authorize requests on behalf of the active account:
 *
 * - before the request: refreshes the access token if it is about to expire and sets the Authorization header;
 * - on the 401 response: refreshes the token and retries the request once.
 *
 * Passing `token` option to the request disables the refresh logic: a string is used as is
 * and `null` sends the request without the Authorization header
 */
export default function createAuthHooks({ dispatch, getState }: Store): Hooks {
    const isAutoRefreshDisabled = (context: RequestContext) => 'token' in context;

    const setAuthorizationHeader = (request: Request, context: RequestContext) => {
        const token = 'token' in context ? context.token : getActiveAccount(getState())?.token;

        if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
        } else {
            request.headers.delete('Authorization');
        }
    };

    /**
     * The hooks are called asynchronously, when the request's span is no longer active.
     * Restore it, so the token refresh span is attached to the request, that has triggered it
     */
    const withRequestSpan = <T>(context: RequestContext, callback: () => T): T =>
        context.span ? Sentry.withActiveSpan(context.span, callback) : callback();

    return {
        beforeRequest: [
            async ({ request, options }) => {
                const context = options.context as RequestContext;
                const isRefreshTokenRequest = new URL(request.url).pathname === REFRESH_TOKEN_URL;

                if (!isAutoRefreshDisabled(context) && !isRefreshTokenRequest && getActiveAccount(getState())) {
                    await withRequestSpan(context, () => dispatch(ensureToken()));
                }

                setAuthorizationHeader(request, context);
            },
        ],

        afterResponse: [
            async ({ response, options }) => {
                const context = options.context as AuthRequestContext;

                // Refresh the token only once, so a still rejected token will not lead to an infinite loop.
                // Don't rely on retryCount: the request may be retried for other reasons
                if (response.status !== 401 || context.isTokenRefreshed || isAutoRefreshDisabled(context)) {
                    return;
                }

                const body = await response.json().catch(() => null);
                const error = createResponseError(response, body);

                // Only the API auth errors are recoverable.
                // Others 401 errors (e.g. oauth's { statusCode: 401, error: 'access_denied' }) are passed to the caller
                if (!(error instanceof UnauthorizedError)) {
                    return;
                }

                try {
                    // Will reject when the error isn't recoverable (and log the user out)
                    await withRequestSpan(context, () => dispatch(recoverFromTokenError(error)));
                } catch {
                    // Let the original 401 response reach the caller
                    return;
                }

                context.isTokenRefreshed = true;
                context.span?.setAttribute('app.auth.token_refreshed', true);

                return ky.retry({ delay: 0 });
            },
        ],

        beforeRetry: [
            ({ request, options }) => {
                // Use the refreshed token
                setAuthorizationHeader(request, options.context as RequestContext);
            },
        ],
    };
}
