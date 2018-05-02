// @flow
import type {User} from 'components/user';
import Raven from 'raven-js';

import abbreviate from './abbreviate';

const isTest = process.env.__TEST__; // eslint-disable-line
const isProduction = process.env.__PROD__; // eslint-disable-line

class Logger {
    init({ sentryCdn }: { sentryCdn: string }) {
        if (sentryCdn) {
            Raven.config(sentryCdn, {
                logger: 'accounts-js-app',
                level: 'info',
                environment: process.env.APP_ENV, // eslint-disable-line
                release: process.env.__VERSION__, // eslint-disable-line
                shouldSendCallback: () => !isTest,
                dataCallback: (data) => {
                    if (!data.level) {
                        // log unhandled errors as info
                        data.level = 'info';
                    }

                    return data;
                },
                whitelistUrls: isProduction ? [
                    /ely\.by/
                ] : []
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
                    event
                });
            });
        }
    }

    setUser(user: User) {
        Raven.setUserContext({
            username: user.username,
            email: user.email,
            id: user.id
        });
    }

    error(message: string | Error, context: Object) {
        log('error', message, context);
    }

    info(message: string | Error, context: Object) {
        log('info', message, context);
    }

    warn(message: string | Error, context: Object) {
        log('warning', message, context);
    }
}

function log(
    level: 'error' | 'warning' | 'info' | 'debug',
    message: string | Error,
    context: Object
) {
    const method: 'error' | 'warn' | 'info' | 'debug' = level === 'warning' ? 'warn' : level;

    if (isTest) {
        return;
    }

    if (typeof context !== 'object') {
        // it would better to always have an object here
        context = {
            message: context
        };
    }

    prepareContext(context).then((context) => {
        console[method](message, context); // eslint-disable-line

        Raven.captureException(message, {
            level,
            extra: context,
        });
    });
}

/**
 * prepare data for JSON.stringify
 *
 * @param  {object} context
 *
 * @return {Promise}
 */
function prepareContext(context: any) {
    if (context instanceof Response) {
        // TODO: rewrite abbreviate to use promises and recursively find Response
        return context.json()
            .catch(() => context.text())
            .then((body) =>
                abbreviate({
                    type: context.type,
                    url: context.url,
                    status: context.status,
                    statusText: context.statusText,
                    body
                })
            );
    } else if (context.originalResponse instanceof Response) {
        return prepareContext(context.originalResponse)
            .then((originalResponse) =>
                abbreviate({
                    ...context,
                    originalResponse
                })
            );
    }

    return Promise.resolve(abbreviate(context));
}

export default new Logger();
