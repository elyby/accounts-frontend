import ApiError, { ResponseBody } from './ApiError';

/**
 * The backend has rejected the submitted data: `{ success: false, errors: { field: 'error.code' }, data?: {...} }`.
 */
export default class ValidationError extends ApiError {
    /**
     * The error codes by the field names, e.g. `{ password: 'error.password_incorrect' }`
     */
    readonly errors: Record<string, string>;

    /**
     * The additional data, that describes the errors, e.g. `{ canRepeatIn: 123 }`
     */
    readonly data: Record<string, any>;

    constructor(response: Response, body: ResponseBody) {
        const errors = isRecord(body.errors) ? body.errors : {};

        super(response, body, `Validation failed: ${Object.values(errors).join(', ') || 'no errors'}`);

        this.name = 'ValidationError';
        this.errors = errors;
        // PHP serializes an empty associative array as []
        this.data = isRecord(body.data) ? body.data : {};
    }
}

function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
