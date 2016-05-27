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
     * @param  {string} name - the name of field
     *
     * @return {Object} ref and name props for component
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

    focus(fieldId) {
        if (!this.fields[fieldId]) {
            throw new Error(`Can not focus. The field with an id ${fieldId} does not exists`);
        }

        this.fields[fieldId].focus();
    }

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

    setErrors(errors) {
        const oldErrors = this.errors;
        this.errors = errors;

        Object.keys(this.fields).forEach((fieldId) => {
            if (oldErrors[fieldId] || errors[fieldId]) {
                this.fields[fieldId].setError(errors[fieldId] || null);
            }
        });
    }

    getError(fieldId) {
        return this.errors[fieldId] || null;
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    serialize() {
        return Object.keys(this.fields).reduce((acc, fieldId) => {
            acc[fieldId] = this.fields[fieldId].getValue();

            return acc;
        }, {});
    }

    /**
     * Bind handler to listen for form loading state change
     *
     * @param {Function} fn
     */
    addLoadingListener(fn) {
        this.removeLoadingListener(fn);
        this.handlers.push(fn);
    }

    /**
     * Remove form loading state handler
     *
     * @param {Function} fn
     */
    removeLoadingListener(fn) {
        this.handlers = this.handlers.filter((handler) => handler !== fn);
    }

    beginLoading() {
        this.handlers.forEach((fn) => fn(true));
    }

    endLoading() {
        this.handlers.forEach((fn) => fn(false));
    }
}
