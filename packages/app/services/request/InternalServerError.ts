import RequestError from './RequestError';

export default class InternalServerError extends RequestError {
    declare readonly response: Response;

    constructor(
        response: Response,
        message: string = `Request failed with status ${response.status}`,
        options?: ErrorOptions,
    ) {
        super(message, { ...options, response });

        this.name = 'InternalServerError';
    }
}
