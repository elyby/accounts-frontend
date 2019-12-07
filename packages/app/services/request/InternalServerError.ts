import { Resp } from './request';

class InternalServerError extends Error {
  error: Error | { [key: string]: any };
  originalResponse: Resp<any>;

  constructor(
    error: Error | string | { [key: string]: any },
    resp?: Response | { [key: string]: any },
  ) {
    super();

    error = error || 'no error message';

    this.name = this.constructor.name;
    this.message = this.constructor.name;
    this.stack = new Error().stack;

    if (resp) {
      this.originalResponse = resp;
    }

    if (typeof error === 'string') {
      error = new Error(error);
    }

    if ('message' in error) {
      this.message = error.message;
    }

    this.error = error;
    Object.assign(this, error);
  }
}

export default InternalServerError;
