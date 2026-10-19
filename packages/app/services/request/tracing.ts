import * as Sentry from '@sentry/react';
import type { Span } from '@sentry/react';

/**
 * The requests to these paths are traced by the request service itself (see `traceRequest`),
 * so the SDK's fetch instrumentation must not create the duplicate spans for them.
 * The trace headers are propagated only to them too: other origins don't allow these headers by CORS
 */
export const API_PATH_REGEX = /^\/api\//;

export interface PathTemplate {
    /**
     * When set, the template is applied only to the requests with this method
     */
    method?: string;
    pattern: RegExp;
    /**
     * Passed to `String.prototype.replace()`, so it may reference the pattern's groups
     */
    replacement: string;
}

/**
 * Replaces the variable parts of the path by the first matched template. Returns the path as is, if none matched
 */
export function applyPathTemplates(templates: ReadonlyArray<PathTemplate>, path: string, method?: string): string {
    const template = templates.find((rule) => (!rule.method || rule.method === method) && rule.pattern.test(path));

    return template ? path.replace(template.pattern, template.replacement) : path;
}

/**
 * Replaces the variable parts of the API urls, so the spans of the same endpoint are grouped together.
 * Only the urls from `app/services/api` are known here
 *
 * Reimplement with URLPattern when it would not require polyfill
 */
const URL_TEMPLATES: ReadonlyArray<PathTemplate> = [
    { pattern: /^\/api\/v1\/accounts\/\d+(?=\/|$)/, replacement: '/api/v1/accounts/{id}' },
    // POST /api/v1/oauth2/{type} creates a new client, where the last segment is a meaningful client type
    { method: 'POST', pattern: /^\/api\/v1\/oauth2\/[^/]+$/, replacement: '$&' },
    { pattern: /^\/api\/v1\/oauth2\/[^/]+(?=\/|$)/, replacement: '/api/v1/oauth2/{clientId}' },
];

/**
 * Returns the url's path without the query string and with the variable parts replaced by the placeholders
 */
export function getUrlTemplate(method: string, url: string): string {
    return applyPathTemplates(URL_TEMPLATES, new URL(url, 'http://localhost').pathname, method);
}

/**
 * Drops the query and the hash of the request's url, and replaces the variable parts of the API urls.
 * The query may contain the secrets, e.g. the OAuth params, and the other origins' urls may too
 */
export function sanitizeRequestUrl(method: string, url: string): string {
    try {
        const { origin, pathname } = new URL(url, window.location.origin);
        const isApi = origin === window.location.origin && API_PATH_REGEX.test(pathname);

        return `${origin}${isApi ? getUrlTemplate(method, pathname) : pathname}`;
    } catch {
        return url.split(/[?#]/)[0];
    }
}

/**
 * Parses the trace sample rate, configured at the build time.
 * Returns undefined (tracing is disabled) for an empty or invalid value
 */
export function parseSampleRate(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const rate = Number(value);

    if (Number.isNaN(rate) || rate < 0 || rate > 1) {
        return undefined;
    }

    return rate;
}

/**
 * Starts a span for the whole request lifecycle: the token refresh, the retries and the response parsing,
 * so its status reflects the error, that will be thrown to the caller.
 *
 * Never put the request body or the search params into the span's attributes: they contain passwords,
 * TOTP codes and OAuth params
 */
export function traceRequest<T>(method: string, url: string, callback: (span: Span) => Promise<T>): Promise<T> {
    const template = getUrlTemplate(method, url);

    return Sentry.startSpanManual(
        {
            name: `${method} ${template}`,
            op: 'http.client',
            // The browser SDK attaches the new spans to the root one by default (`parentSpanIsAlwaysRootSpan`),
            // so the explicitly activated span (e.g. the token refresh, see authHooks) must be passed as the parent
            parentSpan: Sentry.getActiveSpan(),
            attributes: {
                'sentry.origin': 'manual.http.request',
                'http.request.method': method,
                'url.template': template,
                'server.address': typeof window === 'undefined' ? undefined : window.location.hostname,
            },
        },
        async (span) => {
            try {
                const result = await callback(span);
                span.end();

                return result;
            } catch (error) {
                recordError(span, error);
                span.end();

                throw error;
            }
        },
    );
}

/**
 * Returns the headers, that continue the span's trace on the backend.
 * The span is passed explicitly: there is no async context in browsers, so the active span is lost after `await`
 */
export function getTraceHeaders(span: Span): Record<string, string> {
    const { 'sentry-trace': sentryTrace, baggage } = Sentry.getTraceData({ span });
    const headers: Record<string, string> = {};

    if (sentryTrace) {
        headers['sentry-trace'] = sentryTrace;
    }

    if (baggage) {
        headers.baggage = baggage;
    }

    return headers;
}

// The spans, which have received the response. The status of the others is unknown
const respondedSpans = new WeakSet<Span>();

export function recordResponse(span: Span, response: Response): void {
    Sentry.setHttpStatus(span, response.status);
    respondedSpans.add(span);
}

function recordError(span: Span, error: unknown): void {
    if (typeof error === 'object' && error !== null && 'name' in error) {
        // RequestError's `name` is set explicitly in every subclass, unlike `constructor.name`, which is minified
        span.setAttribute('error.type', String(error.name));
    }

    // Usually the status is set by the response (see `recordResponse`). Otherwise it's a network error,
    // an aborted request or an error, thrown from the hooks (e.g. the failed token refresh, whose response
    // status doesn't belong to this request)
    // ValidationError keeps the response's status (200): the invalid forms are the expected behavior
    // and mustn't affect the endpoint's failure rate. They can be found by the `error.type` attribute
    if (!respondedSpans.has(span)) {
        span.setStatus({ code: 2, message: 'internal_error' });
    }
}
