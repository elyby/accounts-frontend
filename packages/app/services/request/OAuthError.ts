import ApiError, { ResponseBody } from './ApiError';

/**
 * The OAuth2 server has rejected the request: `{ error: 'invalid_scope', parameter: 'foo', statusCode: 400 }`
 */
export default class OAuthError extends ApiError {
    /**
     * The error code, e.g. 'invalid_request', 'access_denied', 'invalid_user_code'
     */
    readonly error: string;

    /**
     * The name or the value of the request parameter, that has caused the error
     */
    readonly parameter?: string;

    /**
     * Where to redirect the user, e.g. when they have declined the permissions
     */
    readonly redirectUri?: string;

    constructor(response: Response, body: ResponseBody) {
        super(response, body, body.parameter ? `${body.error} (${body.parameter})` : body.error);

        this.name = 'OAuthError';
        this.error = body.error;
        this.parameter = typeof body.parameter === 'string' ? body.parameter : undefined;
        this.redirectUri = typeof body.redirectUri === 'string' ? body.redirectUri : undefined;
    }

    /**
     * The error caused by the invalid request of the OAuth client (not by the user),
     * that should be shown to the user as is. Not localized, because it's meant for the client's developers
     */
    get userMessage(): string | null {
        switch (this.error) {
            case 'invalid_request':
                return `Invalid request (${this.parameter} required).`;
            case 'unsupported_response_type':
                return `Invalid response type '${this.parameter}'.`;
            case 'unsupported_grant_type':
                return 'Unsupported grant type.';
            case 'invalid_scope':
                return `Invalid scope '${this.parameter}'.`;
            case 'invalid_client':
                return 'Can not find application you are trying to authorize.';
            default:
                return null;
        }
    }
}
