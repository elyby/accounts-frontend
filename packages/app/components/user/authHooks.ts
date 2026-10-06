import ky, { Hooks } from 'ky';

import { ensureToken, recoverFromTokenError } from 'app/components/accounts/actions';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { RequestContext } from 'app/services/request';
import { Store } from 'app/types';

const REFRESH_TOKEN_URL = '/api/authentication/refresh-token';

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

    return {
        beforeRequest: [
            async ({ request, options }) => {
                const context = options.context as RequestContext;
                const isRefreshTokenRequest = new URL(request.url).pathname === REFRESH_TOKEN_URL;

                if (!isAutoRefreshDisabled(context) && !isRefreshTokenRequest && getActiveAccount(getState())) {
                    await dispatch(ensureToken());
                }

                setAuthorizationHeader(request, context);
            },
        ],

        afterResponse: [
            async ({ response, options, retryCount }) => {
                const context = options.context as RequestContext;

                // Retry only once, so a still rejected token will not lead to an infinite loop
                if (response.status !== 401 || retryCount > 0 || isAutoRefreshDisabled(context)) {
                    return;
                }

                type AuthErrorBody = { status?: number; message?: string };
                const { status, message = '' } = await response.json<AuthErrorBody>().catch((): AuthErrorBody => ({}));

                // Only the API auth errors have { status: 401 } in the body.
                // Others 401 errors (e.g. oauth's { statusCode: 401, error: 'access_denied' }) are passed to the caller
                if (status !== 401) {
                    return;
                }

                try {
                    // Will reject when the error isn't recoverable (and log the user out)
                    await dispatch(recoverFromTokenError({ status, message }));
                } catch {
                    // Let the original 401 response reach the caller
                    return;
                }

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
