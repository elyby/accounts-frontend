// @flow
import { InternalServerError } from 'services/request';

import type { Resp } from 'services/request';
import type { logger as Logger } from 'services/logger';

const ABORT_ERR = 20;

export default function BsodMiddleware(dispatchBsod: Function, logger: Logger) {
    return {
        catch<T: Resp<*> | InternalServerError | Error>(resp?: T): Promise<T> {
            const originalResponse: Object = (resp && resp.originalResponse) || {};

            if (
                resp
                && ((resp instanceof InternalServerError
                    && resp.error.code !== ABORT_ERR)
                    || (originalResponse
                        && /5\d\d/.test((originalResponse.status: string))))
            ) {
                dispatchBsod();

                if (!resp.message || !/NetworkError/.test(resp.message)) {
                    let message = 'Unexpected response (BSoD)';

                    if (resp.message) {
                        message = `BSoD: ${resp.message}`;
                    }

                    logger.warn(message, { resp });
                }
            }

            return Promise.reject(resp);
        }
    };
}
