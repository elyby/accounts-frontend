import ApiError, { ResponseBody } from './ApiError';

/**
 * The OAuth2 server has rejected the request:
 * `{ error: 'invalid_request', error_description: 'Code challenge method must be `S256`.', parameter: 'code_challenge_method' }`
 */
export default class OAuthError extends ApiError {
    /**
     * The error code, e.g. 'invalid_request', 'access_denied', 'invalid_user_code'
     */
    readonly error: string;

    readonly description?: string;

    /**
     * The name of the request parameter, that has caused the error
     */
    readonly parameter?: string;

    /**
     * Where to redirect the user (if should)
     */
    readonly redirectUri?: string;

    constructor(response: Response, body: ResponseBody) {
        super(response, body, body.parameter ? `${body.error} (${body.parameter})` : body.error);

        this.name = 'OAuthError';
        this.error = body.error;
        this.description = typeof body.error_description === 'string' ? body.error_description : undefined;
        this.parameter = typeof body.parameter === 'string' ? body.parameter : undefined;
        this.redirectUri = typeof body.redirectUri === 'string' ? body.redirectUri : undefined;
    }

    /**
     * The message, that should be shown to the user, when the error can't be returned to the client.
     * The errors caused by the client's request are shown as is, since only the client's developers can fix them
     */
    get userMessage(): string | null {
        if (this.error === 'invalid_client') {
            return 'Can not find application you are trying to authorize.';
        }

        return this.description ?? null;
    }
}
