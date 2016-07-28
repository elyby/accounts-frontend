import FormInputComponent from './FormInputComponent';

export default class FormModel {
    fields = {};
    errors = {};
    handlers = [];

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

        if (this.getError(name)) {
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
     * @param {object} errors - object maping {fieldId: errorMessage}
     */
    setErrors(errors) {
        const oldErrors = this.errors;
        this.errors = errors;

        Object.keys(this.fields).forEach((fieldId) => {
            if (oldErrors[fieldId] || errors[fieldId]) {
                this.fields[fieldId].setError(errors[fieldId] || null);
            }
        });
    }

    /**
     * Get error by id
     *
     * @param {string} fieldId - an id of field to get error for
     *
     * @return {string|null}
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
