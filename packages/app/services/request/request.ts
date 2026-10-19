import type { Span } from '@sentry/react';
import ky, { type Options as KyOptions, type Hooks, type KyInstance, isNetworkError } from 'ky';

import createResponseError from './createResponseError';
import InternalServerError from './InternalServerError';
import RequestAbortedError from './RequestAbortedError';
import RequestError from './RequestError';
import { API_PATH_REGEX, getTraceHeaders, recordResponse, traceRequest } from './tracing';

export type Resp<T> = T & {
    response: Response;
};

type Data = Record<string, any>;

/**
 * Only the explicitly allowed ky options: the others (`throwHttpErrors`, `json`, `retry`, `hooks`, etc.)
 * would break the assumptions of this client.
 * NOTE: don't add `signal` without checking the browserslist: ky combines it via AbortSignal.any() (Safari 17.4+)
 */
export interface Options extends Pick<KyOptions, 'headers'> {
    searchParams?: Data;
    /**
     * Overrides the active account's token.
     * Pass `null` to send the request without the Authorization header and to disable token auto-refresh
     */
    token?: string | null;
}

/**
 * Per-request data, that is available in the ky hooks as `options.context`
 */
export interface RequestContext extends Record<string, unknown> {
    /**
     * When the key is absent, the active account's token is used
     */
    token?: string | null;
    /**
     * The span of the whole request (see `traceRequest`). The hooks are called asynchronously,
     * when the request's span is no longer active, so it must be referenced explicitly
     */
    span?: Span;
}

export type ErrorListener = (error: unknown) => void;

let client: KyInstance = ky.create({
    // Relative urls can't be resolved outside the browser (e.g. in tests)
    baseUrl: typeof window === 'undefined' ? undefined : window.location.origin,
    timeout: false,
    // Only the forced retries from the hooks are allowed (see `ky.retry()`), no automatic ones
    retry: {
        limit: 1,
        shouldRetry: () => false,
    },
    // Non-2xx responses are handled in `parseResponse`
    throwHttpErrors: false,
    headers: {
        Accept: 'application/json',
    },
    hooks: {
        beforeRequest: [
            ({ request, options }) => {
                const { span } = options.context as RequestContext;

                // Continue the trace on the backend. The SDK's fetch instrumentation keeps the existing headers
                if (span && API_PATH_REGEX.test(new URL(request.url).pathname)) {
                    for (const [name, value] of Object.entries(getTraceHeaders(span))) {
                        request.headers.set(name, value);
                    }
                }
            },
        ],
    },
});

const errorListeners: ErrorListener[] = [];
// A nested request's error (e.g. the token refresh in a hook) may be rethrown by the outer request
const notifiedErrors = new WeakSet<object>();

async function send<T>(
    method: string,
    url: string,
    { token, searchParams, ...options }: Options & { body?: URLSearchParams },
): Promise<Resp<T>> {
    return traceRequest(method, url, async (span) => {
        // `{ token: undefined }` means the same as no token option at all
        const context: RequestContext = token === undefined ? { span } : { token, span };

        try {
            const response = await client(url, {
                ...options,
                method,
                searchParams: searchParams && convertQueryValues(searchParams),
                context,
            });
            recordResponse(span, response);

            return await parseResponse<T>(response);
        } catch (error) {
            const normalizedError = normalizeError(error);
            const isObject = typeof normalizedError === 'object' && normalizedError !== null;

            if (!isObject || !notifiedErrors.has(normalizedError)) {
                if (isObject) {
                    notifiedErrors.add(normalizedError);
                }

                errorListeners.forEach((listener) => listener(normalizedError));
            }

            throw normalizedError;
        }
    });
}

async function parseResponse<T>(response: Response): Promise<Resp<T>> {
    if (response.status === 0) {
        // e.g. the network error response or an opaque response
        throw new RequestAbortedError(response);
    }

    let json: any;

    try {
        // Read a clone to keep the original body available for the logger
        json = await response.clone().json();
    } catch (error) {
        // Very rare, but request might be aborted during its response reading
        if (isAbortError(error)) {
            throw new RequestAbortedError(error);
        }

        // Don't check `instanceof Error`: the error may come from another realm (e.g. jsdom in tests)
        throw new InternalServerError(response, String(error?.message || 'Invalid JSON'), { cause: error });
    }

    const error = createResponseError(response, json);

    if (error) {
        throw error;
    }

    json.response = response;

    return json;
}

function normalizeError(error: unknown): unknown {
    if (error instanceof RequestError) {
        return error;
    }

    // ky wraps the browser's error, but the logger relies on its original message (e.g. 'Failed to fetch')
    if (isNetworkError(error) && error.cause instanceof Error) {
        return new RequestAbortedError(error.cause);
    }

    // e.g. 'TypeError: Failed to fetch' due to CORS or the request was aborted
    if (isNetworkError(error) || isAbortError(error) || error instanceof TypeError) {
        return new RequestAbortedError(error as Error);
    }

    // Errors, thrown from the hooks (e.g. a failed token refresh) are passed as is
    return error;
}

function isAbortError(error: unknown): error is DOMException {
    return error instanceof DOMException && error.name === 'AbortError';
}

export function get<T>(url: string, data?: Data, options: Omit<Options, 'searchParams'> = {}): Promise<Resp<T>> {
    return send<T>('GET', url, { searchParams: data, ...options });
}

export function post<T>(url: string, data?: Data, options: Options = {}): Promise<Resp<T>> {
    return send<T>('POST', url, { body: new URLSearchParams(convertQueryValues(data)), ...options });
}

export function put<T>(url: string, data?: Data, options: Options = {}): Promise<Resp<T>> {
    return send<T>('PUT', url, { body: new URLSearchParams(convertQueryValues(data)), ...options });
}

export function del<T>(url: string, data?: Data, options: Options = {}): Promise<Resp<T>> {
    return send<T>('DELETE', url, { body: new URLSearchParams(convertQueryValues(data)), ...options });
}

/**
 * Registers ky hooks for all subsequent requests. Hooks are appended to the already registered ones
 * and receive the request's {@link RequestContext} as `options.context`
 */
export function addHooks(hooks: Hooks): void {
    client = client.extend({ hooks });
}

/**
 * Registers a listener, that will be notified about every failed request.
 * It can't change the error, which will be thrown to the caller anyway
 */
export function addErrorListener(listener: ErrorListener): void {
    if (!errorListeners.includes(listener)) {
        errorListeners.push(listener);
    }
}

/**
 * Converts specific js values to query friendly values
 */
function convertQueryValue(value: any): string {
    if (typeof value === 'undefined' || value === null) {
        return '';
    }

    if (value === true) {
        return '1';
    }

    if (value === false) {
        return '0';
    }

    return String(value);
}

/**
 * ky would serialize true as 'true', null as 'null' and drop undefined values, but the backend expects 1, 0 and ''
 */
function convertQueryValues(data: Data = {}): Record<string, string> {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, convertQueryValue(value)]));
}
