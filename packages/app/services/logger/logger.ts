import Raven from 'raven-js';

import abbreviate from './abbreviate';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
    init({ sentryDSN }: { sentryDSN: string }) {
        if (sentryDSN) {
            Raven.config(sentryDSN, {
                logger: 'accounts-js-app',
                level: 'info',
                environment: window.location.host === 'account.ely.by' ? 'Production' : 'Development',
                release: process.env.__VERSION__,
                shouldSendCallback: () => !isTest,
                dataCallback: (data) => {
                    if (!data.level) {
                        // log unhandled errors as info
                        data.level = 'info';
                    }

                    return data;
                },
                whitelistUrls: isProduction ? [/ely\.by/] : [],
            }).install();

            window.addEventListener('unhandledrejection', (event) => {
                const error = event.reason || {};

                let message = error.message || error;

                if (typeof message === 'string') {
                    message = `: ${message}`;
                } else {
                    message = '';
                }

                this.info(`Unhandled rejection${message}`, {
                    error,
                    event,
                });
            });
        }
    }

    setUser(user: { username: string | null; email: string | null; id: number | null }) {
        Raven.setUserContext({
            username: user.username,
            email: user.email,
            id: user.id,
        });
    }

    unexpected(message: string | Error, previous: any) {
        // TODO: check whether previous was already handled. Cover with tests
        this.error(message, {
            error: previous,
        });
    }

    error(message: string | Error, context?: { [key: string]: any }) {
        log('error', message, context);
    }

    info(message: string | Error, context?: { [key: string]: any }) {
        log('info', message, context);
    }

    warn(message: string | Error, context?: { [key: string]: any }) {
        log('warning', message, context);
    }

    getLastEventId(): string | void {
        return Raven.lastEventId();
    }
}

function log(level: 'error' | 'warning' | 'info' | 'debug', message: string | Error, context?: Record<string, any>) {
    const method: 'error' | 'warn' | 'info' | 'debug' = level === 'warning' ? 'warn' : level;

    if (isTest) {
        return;
    }

    if (typeof context !== 'object') {
        // it would better to always have an object here
        context = {
            message: context,
        };
    }

    prepareContext(context).then((context) => {
        console[method](message, context); // eslint-disable-line

        Raven.captureException(message, {
            level,
            extra: context,
            ...(typeof message === 'string' ? { fingerprint: [message] } : {}),
        });
    });
}

/**
 * prepare data for JSON.stringify
 *
 * @param  {object} context
 *
 * @returns {Promise}
 */
function prepareContext(context: Record<string, any>): Promise<string> {
    if (context instanceof Response) {
        // TODO: rewrite abbreviate to use promises and recursively find Response
        return context
            .json()
            .catch(() => context.text())
            .then((body) =>
                abbreviate({
                    type: context.type,
                    url: context.url,
                    status: context.status,
                    statusText: context.statusText,
                    body,
                }),
            );
    } else if (context.originalResponse instanceof Response) {
        return prepareContext(context.originalResponse).then((originalResponse) =>
            abbreviate({
                ...context,
                originalResponse,
            }),
        );
    }

    return Promise.resolve(abbreviate(context));
}

export default new Logger();
