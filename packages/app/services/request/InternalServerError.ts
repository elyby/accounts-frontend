import { Resp } from './request';

export default class InternalServerError extends Error {
    public readonly error: Error | Record<string, any>;
    public readonly originalResponse: Resp<any>;

    constructor(error: Error | string | Record<string, any>, resp?: Response | Record<string, any>) {
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
