import { InternalServerError } from 'app/services/request';
import defaultLogger from 'app/services/logger';

type Logger = typeof defaultLogger;

/**
 * Shows BSoD on 5xx responses and unexpected (non-JSON) responses
 */
export default function createBsodErrorListener(dispatchBsod: () => any, logger: Logger = defaultLogger) {
    return (error: unknown): void => {
        if (!(error instanceof InternalServerError)) {
            return;
        }

        dispatchBsod();

        logger.warn(error.message ? `BSoD: ${error.message}` : 'Unexpected response (BSoD)', { resp: error });
    };
}
