import FormInputComponent from 'components/ui/form/FormInputComponent';

export default class Form {
    fields = {};
    errors = {};

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
        const props = {
            name,
            ref: (el) => {
                if (!(el instanceof FormInputComponent)) {
                    throw new Error('Expected a component from components/ui/form module');
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
            throw new Error(`The field with an id ${fieldId} does not exists`);
        }

        this.fields[fieldId].focus();
    }

    value(fieldId) {
        if (!this.fields[fieldId]) {
            throw new Error(`The field with an id ${fieldId} does not exists`);
        }

        return this.fields[fieldId].getValue();
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

    serialize() {
        return Object.keys(this.fields).reduce((acc, fieldId) => {
            acc[fieldId] = this.fields[fieldId].getValue();

            return acc;
        }, {});
    }
}
