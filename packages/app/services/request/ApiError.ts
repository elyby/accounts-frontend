import RequestError from './RequestError';

export type ResponseBody = Record<string, any>;

/**
 * The backend has rejected the request: responded with a non-2xx status or with `{ success: false }`.
 *
 * The known kinds of rejections have their own subclasses: {@link ValidationError}, {@link UnauthorizedError}
 * and {@link OAuthError}. Use `createResponseError()` to get the right one for a response
 */
export default class ApiError extends RequestError {
    declare readonly response: Response;

    /**
     * The parsed response body
     */
    readonly body: ResponseBody;

    constructor(response: Response, body: ResponseBody, message: string = `Request failed with status ${response.status}`) {
        super(message, { response });

        this.name = 'ApiError';
        this.body = body;
    }

    /**
     * The HTTP status code of the response
     */
    get status(): number {
        return this.response.status;
    }
}
