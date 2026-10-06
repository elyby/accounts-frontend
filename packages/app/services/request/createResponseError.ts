import ApiError from './ApiError';
import InternalServerError from './InternalServerError';
import OAuthError from './OAuthError';
import RequestError from './RequestError';
import UnauthorizedError from './UnauthorizedError';
import ValidationError from './ValidationError';

/**
 * Creates the error, that describes the failed response, or returns null for a successful one.
 * The order of the checks matters: the backend's error formats may overlap
 *
 * @param response
 * @param body - the parsed JSON body of the response
 */
export default function createResponseError(response: Response, body: unknown): RequestError | null {
    if (response.status >= 500) {
        const message = (body as Record<string, any> | null)?.message;

        // e.g. Yii's { name: 'Internal Server Error', message: 'An internal server error occurred.' }
        return new InternalServerError(response, typeof message === 'string' && message ? message : undefined);
    }

    // The backend always responds with an object or an array
    if (typeof body !== 'object' || body === null) {
        return new InternalServerError(response, 'Unexpected response body');
    }

    const json = body as Record<string, any>;

    // The backend has ugly API, so it responds with 200, but body states { success: false } and so its validation error
    if (json.success === false && typeof json.errors === 'object' && json.errors !== null) {
        return new ValidationError(response, json);
    }

    if (response.status === 401 && json.name === 'Unauthorized') {
        return new UnauthorizedError(response, json);
    }

    if ((!response.ok || json.success === false) && typeof json.error === 'string') {
        return new OAuthError(response, json);
    }

    if (!response.ok || json.success === false) {
        return new ApiError(response, json);
    }

    return null;
}
