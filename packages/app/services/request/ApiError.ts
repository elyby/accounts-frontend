/**
 * The backend responded with a non-2xx status or with `{ success: false }`.
 *
 * All the fields of the response body (`errors`, `message`, `status`, `statusCode`, `data`, etc.)
 * are copied onto the error itself, so they can be accessed directly: `error.errors.password`
 */
// The index signature lives in the merged interface: react-hot-loader's babel plugin crashes on it in a class body
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ApiError<T extends Record<string, any> = Record<string, any>> {
    [key: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class ApiError<T extends Record<string, any> = Record<string, any>> extends Error {
    public readonly originalResponse: Response;
    public readonly body: T;

    constructor(body: T | null | undefined, response: Response) {
        super(`Request failed with status ${response.status}`);

        this.name = 'ApiError';
        this.originalResponse = response;
        this.body = body || ({} as T);

        if (typeof body === 'object' && body !== null) {
            Object.assign(this, body);
        }
    }
}

export default ApiError;
