import FormInputComponent from './FormInputComponent';

type LoadingListener = (isLoading: boolean) => void;

export type ValidationError =
    | string
    | {
          type: string;
          payload?: Record<string, any>;
      };

export default class FormModel {
    fields: Record<string, any> = {};
    errors: Record<string, ValidationError> = {};
    handlers: Array<LoadingListener> = [];
    renderErrors: boolean;
    _isLoading: boolean;

    /**
     * @param {object} options
     * @param {bool} [options.renderErrors=true] - whether the bound filed should
     *                                             render their errors
     */
    constructor(options: { renderErrors?: boolean } = {}) {
        this.renderErrors = options.renderErrors !== false;
    }

    hasField(fieldId: string): boolean {
        return !!this.fields[fieldId];
    }

    /**
     * Connects form with React's component
     *
     * Usage:
     * <input {...this.form.bindField('foo')} type="text" />
     *
     * @param {string} name - the name of field
     *
     * @returns {object} - ref and name props for component
     */
    bindField(name: string): {
        name: string;
        ref: (el: any) => void;
        error?: ValidationError;
    } {
        this.fields[name] = {};

        const props: {
            name: string;
            ref: (el: any) => void;
            error?: ValidationError;
        } = {
            name,
            ref: (el: FormInputComponent<any> | null) => {
                if (el) {
                    if (!(el instanceof FormInputComponent)) {
                        throw new Error('Expected FormInputComponent component');
                    }

                    this.fields[name] = el;
                } else {
                    delete this.fields[name];
                }
            },
        };

        const error = this.getError(name);

        if (this.renderErrors && error) {
            props.error = error;
        }

        return props;
    }

    /**
     * Focuses field
     *
     * @param {string} fieldId - an id of field to focus
     */
    focus(fieldId: string): void {
        if (!this.fields[fieldId]) {
            throw new Error(`Can not focus. The field with an id ${fieldId} does not exists`);
        }

        this.fields[fieldId].focus();
    }

    /**
     * Get a value of field
     *
     * @param {string} fieldId - an id of field to get value of
     *
     * @returns {string}
     */
    value(fieldId: string): string {
        const field = this.fields[fieldId];

        if (!field) {
            throw new Error(`Can not get value. The field with an id ${fieldId} does not exists`);
        }

        if (!field.getValue) {
            return ''; // the field was not initialized through ref yet
        }

        return field.getValue();
    }

    /**
     * Add errors to form fields
     *
     * errorType may be string or object {type: string, payload: object}, where
     * payload is additional data for errorType
     *
     * @param {object} errors - object maping {fieldId: errorType}
     */
    setErrors(errors: Record<string, ValidationError>): void {
        if (typeof errors !== 'object' || errors === null) {
            throw new Error('Errors must be an object');
        }

        const oldErrors = this.errors;
        this.errors = errors;

        Object.keys(this.fields).forEach((fieldId) => {
            if (this.renderErrors) {
                if (oldErrors[fieldId] || errors[fieldId]) {
                    this.fields[fieldId].setError(errors[fieldId] || null);
                }
            }

            if (this.hasErrors()) {
                this.fields[fieldId].onFormInvalid();
            }
        });
    }

    /**
     * Clear errors in form fields
     */
    clearErrors(): void {
        this.errors = {};
        Object.values(this.fields).forEach((field) => field.setError(null));
    }

    getFirstError(): ValidationError | null {
        const [error] = Object.values(this.errors);

        return error || null;
    }

    getError(fieldId: string): ValidationError | null {
        return this.errors[fieldId] || null;
    }

    hasErrors(): boolean {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Convert form into key-value object representation
     *
     * @returns {object}
     */
    serialize(): Record<string, any> {
        return Object.keys(this.fields).reduce((acc, fieldId) => {
            const field = this.fields[fieldId];

            if (field) {
                acc[fieldId] = field.getValue();
            } else {
                console.warn('Can not serialize %s field. Because it is null', fieldId);
            }

            return acc;
        }, {} as Record<string, any>);
    }

    /**
     * Bind handler to listen for form loading state change
     *
     * @param {Function} fn
     */
    addLoadingListener(fn: LoadingListener): void {
        this.removeLoadingListener(fn);
        this.handlers.push(fn);
    }

    /**
     * Remove form loading state handler
     *
     * @param {Function} fn
     */
    removeLoadingListener(fn: LoadingListener): void {
        this.handlers = this.handlers.filter((handler) => handler !== fn);
    }

    /**
     * Switch form in loading state
     */
    beginLoading(): void {
        this._isLoading = true;
        this.notifyHandlers();
    }

    /**
     * Disable loading state
     */
    endLoading(): void {
        this._isLoading = false;
        this.notifyHandlers();
    }

    private notifyHandlers(): void {
        this.handlers.forEach((fn) => fn(this._isLoading));
    }
}
