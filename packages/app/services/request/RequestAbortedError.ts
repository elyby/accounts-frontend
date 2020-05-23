export default class RequestAbortedError extends Error {
    private error: Error | Response;

    constructor(error: Error | Response) {
        super();

        this.name = this.constructor.name;
        this.message = this.constructor.name;
        this.stack = new Error().stack;

        if ('message' in error) {
            this.message = error.message;
        }

        this.error = error;
        Object.assign(this, error);
    }
}
