// @flow
import { InternalServerError } from 'services/request';

import type { Resp } from 'services/request';
import type { logger as Logger } from 'services/logger';

const ABORT_ERR = 20;

export default function BsodMiddleware(dispatchBsod: Function, logger: Logger) {
    return {
        catch<T: Resp<*> | InternalServerError>(resp?: T): Promise<T> {
            if (resp && (
                (resp instanceof InternalServerError
                        && resp.error.code !== ABORT_ERR
                ) || (resp.originalResponse
                    && /5\d\d/.test((resp.originalResponse.status: string))
                )
            )) {
                dispatchBsod();

                if (!resp.message || !/NetworkError/.test(resp.message)) {
                    let message = 'Unexpected response (BSoD)';

                    if (resp.message) {
                        message = `BSoD: ${resp.message}`;
                    }

                    logger.warn(message, {resp});
                }
            }

            return Promise.reject(resp);
        }
    };
}
