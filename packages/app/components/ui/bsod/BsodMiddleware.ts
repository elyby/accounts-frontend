import { InternalServerError } from 'app/services/request';
import { Resp, Middleware } from 'app/services/request';
import defaultLogger from 'app/services/logger';

type Logger = typeof defaultLogger;

const ABORT_ERR = 20;

class BsodMiddleware implements Middleware {
  dispatchBsod: () => any;
  logger: Logger;

  constructor(dispatchBsod: () => any, logger: Logger = defaultLogger) {
    this.dispatchBsod = dispatchBsod;
    this.logger = logger;
  }

  async catch<T extends Resp<any>>(
    resp?: T | InternalServerError | Error,
  ): Promise<T> {
    const { originalResponse }: { originalResponse?: Resp<any> } = (resp ||
      {}) as InternalServerError;

    if (
      resp &&
      ((resp instanceof InternalServerError &&
        (resp.error as any).code !== ABORT_ERR) ||
        (originalResponse && /5\d\d/.test(originalResponse.status)))
    ) {
      this.dispatchBsod();

      const { message: errorMessage } = resp as { [key: string]: any };

      if (!errorMessage || !/NetworkError/.test(errorMessage)) {
        let message = 'Unexpected response (BSoD)';

        if (errorMessage) {
          message = `BSoD: ${errorMessage}`;
        }

        this.logger.warn(message, { resp });
      }
    }

    return Promise.reject(resp);
  }
}

export default BsodMiddleware;
