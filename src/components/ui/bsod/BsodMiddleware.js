// @flow
import { InternalServerError } from 'services/request';

import type { Resp } from 'services/request';
import type { logger as Logger } from 'services/logger';

const ABORT_ERR = 20;

export default function BsodMiddleware(dispatchBsod: Function, logger: Logger) {
    return {
        catch(resp?: Resp|InternalServerError): Promise<Resp> {
            if (resp && (
                (resp instanceof InternalServerError
                        && InternalServerError.error.code !== ABORT_ERR
                ) || (resp.originalResponse
                    && /404|5\d\d/.test(resp.originalResponse.status)
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
