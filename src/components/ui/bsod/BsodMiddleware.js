import { InternalServerError } from 'services/request';

export default function BsodMiddleware(dispatchBsod, logger) {
    return {
        catch(resp = {}) {
            if (resp instanceof InternalServerError
                || (resp.originalResponse
                    && /404|5\d\d/.test(resp.originalResponse.status)
                )
            ) {
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
