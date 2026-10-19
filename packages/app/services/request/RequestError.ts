export default class RequestError extends Error {
    readonly response?: Response;

    constructor(message: string, options?: ErrorOptions & { response?: Response }) {
        super(message, options);

        // Set explicitly in every subclass: `this.constructor.name` is minified in the production build
        this.name = 'RequestError';
        this.response = options?.response;
    }
}
