import * as Sentry from '@sentry/react';
import type { History } from 'history';

import { RequestError } from 'app/services/request';
import {
    API_PATH_REGEX,
    applyPathTemplates,
    sanitizeRequestUrl,
    type PathTemplate,
} from 'app/services/request/tracing';

import { isExclusivelyThirdPartyErrorBoundaryEvent } from './thirdPartyErrors';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

type Level = 'error' | 'warning' | 'info';
// @sentry/core, which exports this type, isn't a direct dependency
type StartSpanOptions = Parameters<typeof Sentry.startSpan>[0];
type Context = Record<string, any>;

// Chrome, Firefox, Safari, whatwg-fetch polyfill
const NETWORK_ERRORS = '(Failed to fetch|NetworkError when attempting to fetch resource\\.?|Load failed|Network request failed)';
const NETWORK_ERROR_REGEX = new RegExp(`^${NETWORK_ERRORS}( \\(.+\\))?$`);

/**
 * Errors that are caused by the user's environment (browser extensions, injected scripts, third-party SDKs, network)
 * and that we can't fix
 */
const IGNORE_ERRORS: Array<string | RegExp> = [
    // Network failures in different browsers. Matches "TypeError: Failed to fetch", our wrappers like "RequestAbortedError: Failed to fetch",
    // the SDK's fetch instrumentation suffix "Failed to fetch (account.ely.by)" and non-Error rejections like
    // "'Unauthorized' captured as exception with message 'Failed to fetch'"
    new RegExp(`(^|: |')${NETWORK_ERRORS}( \\(.+\\))?('|$)`),
    // webpack's ChunkLoadError. Chunk files have the content hash only in the query string, so their URLs stay
    // valid after a deploy: the loading fails because of the user's network or content blockers
    /Loading (CSS )?chunk [\w-]+ failed/,
    // Google reCAPTCHA internals
    /reCAPTCHA Timeout/,
    /No reCAPTCHA clients exist/,
    // Microsoft Outlook SafeLinks scanner
    /Object Not Found Matching Id:\d+/,
    // Scripts injected into the page by launchers and browser extensions
    /Identifier 'nativeIframe' has already been declared/,
    /not allowed by ACL/,
    /MetaMask/,
];

/**
 * Errors that are already handled by the app, but still propagate to the callers, which don't always catch them
 */
const handledErrors = new WeakSet<object>();

const DENY_URLS: Array<RegExp> = [
    /^(chrome|moz|safari(-web)?)-extension:\/\//,
    /^webkit-masked-url:\/\//,
];

/**
 * Pages, whose paths contain the secret keys or the ids. The other paths are used as is.
 * The page's path becomes the name of the pageload/navigation span, which is also sent
 * to the backend in the `baggage` header and attached to the error events as the transaction
 */
const PAGE_TEMPLATES: ReadonlyArray<PathTemplate> = [
    { pattern: /^\/activation\/[^/]+$/, replacement: '/activation/{key}' },
    { pattern: /^\/recover-password\/[^/]+$/, replacement: '/recover-password/{key}' },
    { pattern: /^(\/profile\/change-email\/[^/]+)\/[^/]+$/, replacement: '$1/{code}' },
    { pattern: /^\/dev\/applications\/(?!new$)[^/]+$/, replacement: '/dev/applications/{clientId}' },
    { pattern: /^(\/oauth2\/v\d+)\/[^/]+$/, replacement: '$1/{clientId}' },
];

export function getPageTemplate(path: string): string {
    return applyPathTemplates(PAGE_TEMPLATES, path);
}

/**
 * Replaces the secret parts of the page's path and drops the query and the hash:
 * they may contain arbitrary data, e.g. the OAuth client's params (the safe ones are attached by oauthDebugContext)
 */
export function sanitizePageUrl(url: string): string {
    try {
        const { origin, pathname } = new URL(url);

        return `${origin}${getPageTemplate(pathname)}`;
    } catch {
        // Not an absolute url, e.g. the SDK couldn't read the location
        return getPageTemplate(url.split(/[?#]/)[0]);
    }
}

class Logger {
    /**
     * Sentry drops breadcrumbs that are added before the initialization,
     * but some modules (e.g. localStorage) leave them right on import
     */
    private pendingBreadcrumbs: Array<Sentry.Breadcrumb> | null = [];

    /**
     * Tracing is disabled when `tracesSampleRate` is undefined.
     * The error events are still linked with the backend ones by the trace id
     */
    init({
        sentryDSN,
        tracesSampleRate,
        history,
    }: {
        sentryDSN: string;
        tracesSampleRate?: number;
        history: History;
    }) {
        if (!sentryDSN || isTest) {
            this.pendingBreadcrumbs = null;

            return;
        }

        const applicationKey = process.env.__SENTRY_APPLICATION_KEY__;

        Sentry.init({
            dsn: sentryDSN,
            environment: window.location.host === 'account.ely.by' ? 'Production' : 'Development',
            release: process.env.__VERSION__,
            allowUrls: isProduction ? [/ely\.by/] : undefined,
            denyUrls: DENY_URLS,
            ignoreErrors: IGNORE_ERRORS,
            // Enough to reach fields like extra.resp.response.body.errors.*
            normalizeDepth: 6,
            beforeSendSpan(span) {
                const { attributes } = span;
                const url = attributes['url.full'];

                // The SDK puts the raw urls into the spans: the pages' ones into the browser metrics spans,
                // the requests' ones (with the query, e.g. the analytics' params, containing the page's url)
                // into the http.client spans. The pageload/navigation spans are already sanitized by sanitizePageSpan()
                if (typeof url === 'string') {
                    attributes['url.full'] =
                        attributes['sentry.op'] === 'http.client'
                            ? sanitizeRequestUrl(String(attributes['http.request.method'] ?? 'GET'), url)
                            : sanitizePageUrl(url);
                }

                delete attributes['url.query'];

                return span;
            },
            beforeBreadcrumb(breadcrumb) {
                // The history changes, recorded by the SDK. Pages' urls are sanitized like the event's request.url
                if (breadcrumb.category === 'navigation' && breadcrumb.data) {
                    const { from, to } = breadcrumb.data;
                    breadcrumb.data = {
                        ...breadcrumb.data,
                        from: typeof from === 'string' ? sanitizePageUrl(from) : from,
                        to: typeof to === 'string' ? sanitizePageUrl(to) : to,
                    };
                }

                // The requests, recorded by the SDK. The data object may be shared with the SDK, so it's copied
                if ((breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') && breadcrumb.data) {
                    const { method, url } = breadcrumb.data;

                    if (typeof url === 'string') {
                        breadcrumb.data = {
                            ...breadcrumb.data,
                            url: sanitizeRequestUrl(typeof method === 'string' ? method.toUpperCase() : 'GET', url),
                        };
                    }
                }

                return breadcrumb;
            },
            beforeSend(event, hint) {
                const error = hint.originalException;

                if (typeof error === 'object' && error !== null && handledErrors.has(error)) {
                    return null;
                }

                // The SDK names the transaction by the raw page's path, see sanitizePageSpan() for the spans
                if (event.transaction) {
                    event.transaction = getPageTemplate(event.transaction);
                }

                if (event.request?.url) {
                    event.request.url = sanitizePageUrl(event.request.url);
                }

                // The integration below doesn't recognize third-party errors caught by an ErrorBoundary,
                // see isExclusivelyThirdPartyErrorBoundaryEvent for details
                if (applicationKey && isExclusivelyThirdPartyErrorBoundaryEvent(event, applicationKey)) {
                    event.tags = { ...event.tags, third_party_code: true };
                }

                return event;
            },
            tracesSampleRate,
            // Matched against the pathname for the same origin requests. Other origins don't allow these headers
            tracePropagationTargets: [API_PATH_REGEX],
            integrations: [
                ...(tracesSampleRate === undefined
                    ? []
                    : [
                          Sentry.reactRouterV5BrowserTracingIntegration({
                              history,
                              beforeStartSpan: sanitizePageSpan,
                              // The API requests are traced by the request service (see services/request/tracing)
                              shouldCreateSpanForRequest: (url) => !isApiUrl(url),
                          }),
                      ]),
                ...(applicationKey
                    ? [
                          // Our bundles are marked with this key by @sentry/webpack-plugin (see webpack.config.js).
                          // Errors that have no frames from our code come from browser extensions or scripts
                          // injected by the WebView hosts. For now they are only tagged to verify the filter
                          // before dropping them
                          Sentry.thirdPartyErrorFilterIntegration({
                              filterKeys: [applicationKey],
                              behaviour: 'apply-tag-if-exclusively-contains-third-party-frames',
                              // Skip the SDK's own wrapper frame (e.g. sentryWrapped around setTimeout callbacks),
                              // which is bundled into our code and would otherwise mark an injected script's error
                              // as ours
                              ignoreSentryInternalFrames: true,
                          }),
                      ]
                    : []),
            ],
        });

        const pending = this.pendingBreadcrumbs || [];
        this.pendingBreadcrumbs = null;
        pending.forEach((breadcrumb) => Sentry.addBreadcrumb(breadcrumb));
    }

    setUser(user: { username: string | null; email: string | null; id: number | null }) {
        Sentry.setUser({
            id: user.id ?? undefined,
            username: user.username ?? undefined,
            email: user.email ?? undefined,
        });
    }

    /**
     * Sets a searchable tag that will be attached to all the following events. Pass undefined to remove it
     */
    setTag(key: string, value: string | undefined) {
        Sentry.setTag(key, value);
    }

    /**
     * Registers a function that will be called for every reported event to attach the actual state of some part
     * of the app. The provider should return null when there is nothing to attach
     */
    addContextProvider(name: string, provider: () => { context: Context; tags?: Record<string, string> } | null) {
        Sentry.addEventProcessor((event) => {
            let data: ReturnType<typeof provider>;
            try {
                data = provider();
            } catch {
                // A broken provider must not prevent the event from being reported
                return event;
            }

            if (data) {
                event.contexts = { ...event.contexts, [name]: data.context };
                event.tags = { ...event.tags, ...data.tags };
            }

            return event;
        });
    }

    unexpected(message: string | Error, previous: any) {
        // TODO: check whether previous was already handled. Cover with tests
        this.error(message, {
            error: previous,
        });
    }

    error(message: string | Error, context?: Context) {
        log('error', message, context, Logger.prototype.error);
    }

    info(message: string | Error, context?: Context) {
        log('info', message, context, Logger.prototype.info);
    }

    warn(message: string | Error, context?: Context) {
        log('warning', message, context, Logger.prototype.warn);
    }

    /**
     * Leaves a trace that will be attached to the next reported event, but doesn't create an event by itself.
     * Use it for expected situations that are useful only as a context for other errors
     */
    breadcrumb(message: string, data?: Context) {
        if (isTest) {
            return;
        }

        const breadcrumb: Sentry.Breadcrumb = {
            category: 'app',
            level: 'info',
            message,
            data,
            timestamp: Date.now() / 1000,
        };

        if (this.pendingBreadcrumbs) {
            this.pendingBreadcrumbs.push(breadcrumb);
        } else {
            Sentry.addBreadcrumb(breadcrumb);
        }
    }

    /**
     * Marks the error as handled: it won't be reported if it reaches Sentry later, e.g. as an unhandled rejection
     * from a caller that doesn't catch it. The error itself must be passed, not a copy or a wrapper
     */
    markAsHandled(error: unknown) {
        if (typeof error === 'object' && error !== null) {
            handledErrors.add(error);
        }
    }

    getLastEventId(): string | undefined {
        return Sentry.lastEventId();
    }
}

/**
 * Names the pageload/navigation span by the page's path, replacing the secret parts of it.
 * The SDK puts the raw url into the span's attributes too, so they are replaced as well.
 * The error events' transaction is replaced in `beforeSend`: the SDK sets it after this hook on navigation.
 * The history listeners are called after the location is changed, so it's actual for the navigation spans
 */
function sanitizePageSpan(options: StartSpanOptions): StartSpanOptions {
    const path = getPageTemplate(window.location.pathname);

    return {
        ...options,
        name: path,
        attributes: {
            ...options.attributes,
            'url.path': path,
            'url.full': sanitizePageUrl(window.location.href),
        },
    };
}

function isApiUrl(url: string): boolean {
    try {
        const parsed = new URL(url, window.location.origin);

        return parsed.origin === window.location.origin && API_PATH_REGEX.test(parsed.pathname);
    } catch {
        return false;
    }
}

/**
 * Every logged message is reported as an exception, created right here, synchronously: its stack leads to the code
 * that called the logger (`stackStart` and the frames below it are cut off where the browser supports that).
 * A message reported via captureMessage() would get either no stack at all or a synthetic one taken in the async
 * callback below, which turns the event into an untyped exception titled by that callback's name.
 *
 * When the context contains an Error, it's attached as the `cause`, so Sentry shows the chain: our message on top
 * and the original error with its own stack below (like `new Exception($message, previous: $e)` in PHP)
 */
function log(level: Level, message: string | Error, rawContext: Context | undefined, stackStart: Function) {
    const method = level === 'warning' ? 'warn' : level;

    if (isTest) {
        return;
    }

    // it would better to always have an object here
    const context: Context =
        typeof rawContext === 'object' && rawContext !== null ? rawContext : { message: rawContext };

    let error: Error;

    if (message instanceof Error) {
        error = message;
    } else {
        error = new Error(message);
        Error.captureStackTrace?.(error, stackStart);
    }

    const cause = findError(context);

    if (cause && cause !== error && error.cause === undefined) {
        error.cause = cause;
    }

    prepareContext(context).then((preparedContext) => {
        console[method](message, context); // eslint-disable-line

        if (isNetworkError(context)) {
            // The user has connectivity problems, there is nothing we can do about it
            Sentry.addBreadcrumb({
                category: 'app',
                level,
                message: error.message,
                data: preparedContext,
            });

            return;
        }

        Sentry.withScope((scope) => {
            scope.setLevel(level);
            scope.setExtras(preparedContext);
            Sentry.captureException(error);
        });
    });
}

/**
 * Finds the error that caused the logged situation.
 * The context may have different shapes: the error itself, `{ error }` or `{ resp }`
 */
function findError(context: Context): Error | undefined {
    return [context, context.error, context.resp].find((value): value is Error => value instanceof Error);
}

/**
 * Checks whether the logged context is caused by a failed network request.
 * The context may have different shapes: the error itself, `{ error }`, `{ resp }` or `{ resp: { error } }`
 */
function isNetworkError(context: Context, depth: number = 0): boolean {
    if (!context || typeof context !== 'object' || depth > 2) {
        return false;
    }

    if (typeof context.message === 'string' && NETWORK_ERROR_REGEX.test(context.message)) {
        return true;
    }

    return isNetworkError(context.error, depth + 1) || isNetworkError(context.resp, depth + 1);
}

/**
 * Prepares the context to be sent to Sentry. The SDK normalizes the data itself (errors, circular references, depth),
 * so here we only need to extract the things it can't: the non-enumerable fields of an Error used as the whole context
 * and the bodies of Response objects
 */
async function prepareContext(context: Context): Promise<Context> {
    if (context instanceof Response) {
        return describeResponse(context);
    }

    const prepared: Context = context instanceof Error ? copyError(context) : { ...context };

    // Our request errors keep the Response in the `response` field, which the SDK serializes
    // as an empty object. It may be in the context itself or one level deeper: `{ resp }`, `{ error }`
    if (context instanceof RequestError && context.response) {
        prepared.response = await describeResponse(context.response);
    }

    for (const key of Object.keys(prepared)) {
        const value = prepared[key];

        if (value instanceof RequestError && value.response) {
            const copy = copyError(value);
            copy.response = await describeResponse(value.response);
            prepared[key] = copy;
        }
    }

    return prepared;
}

function copyError(error: Error): Context {
    // name, message and stack are non-enumerable
    return { ...error, name: error.name, message: error.message, stack: error.stack };
}

async function describeResponse(response: Response): Promise<Context> {
    return {
        type: response.type,
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        body: await readBody(response),
    };
}

async function readBody(response: Response): Promise<unknown> {
    // The body might be already consumed by the code that has produced this response
    if (response.bodyUsed) {
        return '[body already read]';
    }

    let text: string;
    try {
        text = await response.clone().text();
    } catch {
        return '[failed to read body]';
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export default new Logger();
