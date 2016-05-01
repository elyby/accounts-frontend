export default class Form {
    fields = {};

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
        return {
            name,
            ref: (el) => {
                // TODO: validate React component
                this.fields[name] = el;
            }
        };
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

    serialize() {
        return Object.keys(this.fields).reduce((acc, key) => {
            acc[key] = this.fields[key].getValue();

            return acc;
        }, {});
    }
}
