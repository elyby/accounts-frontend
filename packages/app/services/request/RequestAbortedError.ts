import RequestError from './RequestError';

/**
 * The request has failed without a response from the backend: network problems, CORS, aborted request, etc.
 */
export default class RequestAbortedError extends RequestError {
    constructor(cause: Error | Response) {
        if (cause instanceof Response) {
            // e.g. the network error response or an opaque response
            super('Request aborted', { response: cause });
        } else {
            // Keep the browser's message: the logger filters network errors by it (e.g. 'Failed to fetch')
            super(cause.message, { cause });
        }

        this.name = 'RequestAbortedError';
    }
}
