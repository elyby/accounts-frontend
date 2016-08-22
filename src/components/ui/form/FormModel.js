import FormInputComponent from './FormInputComponent';

export default class FormModel {
    fields = {};
    errors = {};
    handlers = [];

    /**
     * @param {object} options
     * @param {bool} [options.renderErrors=true] - whether the bound filed should
     *                                             render their errors
     */
    constructor(options = {}) {
        this.renderErrors = options.renderErrors !== false;
    }

    /**
     * Connects form with React's component
     *
     * Usage:
     * <input {...this.form.bindField('foo')} type="text" />
     *
     * @param {string} name - the name of field
     *
     * @return {object} - ref and name props for component
     */
    bindField(name) {
        this.fields[name] = {};

        const props = {
            name,
            ref: (el) => {
                if (el && !(el instanceof FormInputComponent)) {
                    throw new Error('Expected FormInputComponent component');
                }

                this.fields[name] = el;
            }
        };

        if (this.renderErrors && this.getError(name)) {
            props.error = this.getError(name);
        }

        return props;
    }

    /**
     * Focuses field
     *
     * @param {string} fieldId - an id of field to focus
     */
    focus(fieldId) {
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
     * @return {string}
     */
    value(fieldId) {
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
    setErrors(errors) {
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

            this.fields[fieldId].onFormInvalid();
        });
    }

    /**
     * @return {object|string|null}
     */
    getFirstError() {
        return this.errors ? Object.values(this.errors).shift() : null;
    }

    /**
     * Get error by id
     *
     * @param {string} fieldId - an id of field to get error for
     *
     * @return {string|object|null}
     */
    getError(fieldId) {
        return this.errors[fieldId] || null;
    }

    /**
     * @return {bool}
     */
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Convert form into key-value object representation
     *
     * @return {object}
     */
    serialize() {
        return Object.keys(this.fields).reduce((acc, fieldId) => {
            acc[fieldId] = this.fields[fieldId].getValue();

            return acc;
        }, {});
    }

    /**
     * Bind handler to listen for form loading state change
     *
     * @param {function} fn
     */
    addLoadingListener(fn) {
        this.removeLoadingListener(fn);
        this.handlers.push(fn);
    }

    /**
     * Remove form loading state handler
     *
     * @param {function} fn
     */
    removeLoadingListener(fn) {
        this.handlers = this.handlers.filter((handler) => handler !== fn);
    }

    /**
     * Switch form in loading state
     */
    beginLoading() {
        this._isLoading = true;
        this.notifyHandlers();
    }

    /**
     * Disable loading state
     */
    endLoading() {
        this._isLoading = false;
        this.notifyHandlers();
    }

    /**
     * @api private
     */
    notifyHandlers() {
        this.handlers.forEach((fn) => fn(this._isLoading));
    }
}
