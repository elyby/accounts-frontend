import * as Sentry from '@sentry/react';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

type Level = 'error' | 'warning' | 'info';
type Context = Record<string, any>;

// Chrome, Firefox, Safari, whatwg-fetch polyfill
const NETWORK_ERRORS = '(Failed to fetch|NetworkError when attempting to fetch resource\\.?|Load failed|Network request failed)';
const NETWORK_ERROR_REGEX = new RegExp(`^${NETWORK_ERRORS}( \\(.+\\))?$`);

/**
 * Errors that are caused by the user's environment (browser extensions, injected scripts, third-party SDKs, network)
 * and that we can't fix
 */
const IGNORE_ERRORS: Array<string | RegExp> = [
    // Network failures in different browsers. Matches "TypeError: Failed to fetch", our wrappers like "o: Failed to fetch",
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

class Logger {
    /**
     * Sentry drops breadcrumbs that are added before the initialization,
     * but some modules (e.g. localStorage) leave them right on import
     */
    private pendingBreadcrumbs: Array<Sentry.Breadcrumb> | null = [];

    init({ sentryDSN }: { sentryDSN: string }) {
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
            // Enough to reach fields like extra.resp.originalResponse.body.errors.*
            normalizeDepth: 6,
            beforeSend(event, hint) {
                const error = hint.originalException;

                if (typeof error === 'object' && error !== null && handledErrors.has(error)) {
                    return null;
                }

                return event;
            },
            integrations: applicationKey
                ? [
                      // Our bundles are marked with this key by @sentry/webpack-plugin (see webpack.config.js).
                      // Errors that have no frames from our code come from browser extensions or scripts injected by
                      // the WebView hosts. For now they are only tagged to verify the filter before dropping them
                      Sentry.thirdPartyErrorFilterIntegration({
                          filterKeys: [applicationKey],
                          behaviour: 'apply-tag-if-exclusively-contains-third-party-frames',
                      }),
                  ]
                : [],
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
        log('error', message, context);
    }

    info(message: string | Error, context?: Context) {
        log('info', message, context);
    }

    warn(message: string | Error, context?: Context) {
        log('warning', message, context);
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

function log(level: Level, message: string | Error, rawContext?: Context) {
    const method = level === 'warning' ? 'warn' : level;

    if (isTest) {
        return;
    }

    // it would better to always have an object here
    const context: Context =
        typeof rawContext === 'object' && rawContext !== null ? rawContext : { message: rawContext };

    prepareContext(context).then((preparedContext) => {
        console[method](message, context); // eslint-disable-line

        if (isNetworkError(context)) {
            // The user has connectivity problems, there is nothing we can do about it
            Sentry.addBreadcrumb({
                category: 'app',
                level,
                message: message instanceof Error ? message.message : message,
                data: preparedContext,
            });

            return;
        }

        Sentry.withScope((scope) => {
            scope.setLevel(level);
            scope.setExtras(preparedContext);

            if (message instanceof Error) {
                Sentry.captureException(message);
            } else {
                Sentry.captureMessage(message);
            }
        });
    });
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

    // Our request errors keep the Response in the `originalResponse` field, which the SDK serializes
    // as an empty object. It may be in the context itself or one level deeper: `{ resp }`, `{ error }`
    if (prepared.originalResponse instanceof Response) {
        prepared.originalResponse = await describeResponse(prepared.originalResponse);
    }

    for (const key of Object.keys(prepared)) {
        const value = prepared[key];

        if (typeof value === 'object' && value !== null && value.originalResponse instanceof Response) {
            const copy: Context = value instanceof Error ? copyError(value) : { ...value };
            copy.originalResponse = await describeResponse(value.originalResponse);
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
