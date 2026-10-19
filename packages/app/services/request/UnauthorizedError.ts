import ApiError, { ResponseBody } from './ApiError';

const RECOVERABLE_REASONS = [
    'Token expired',
    'Incorrect token',
    'You are requesting with an invalid credential.',
];

/**
 * The backend has rejected the access token: `{ name: 'Unauthorized', message: 'Token expired', status: 401 }`
 */
export default class UnauthorizedError extends ApiError {
    /**
     * Why the token was rejected, e.g. 'Token expired'
     */
    readonly reason: string;

    constructor(response: Response, body: ResponseBody) {
        const reason = typeof body.message === 'string' ? body.message : '';

        super(response, body, reason || 'Unauthorized');

        this.name = 'UnauthorizedError';
        this.reason = reason;
    }

    /**
     * Whether the request may succeed after refreshing the access token
     */
    get isRecoverable(): boolean {
        return RECOVERABLE_REASONS.includes(this.reason);
    }
}
