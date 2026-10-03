import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { FormModel } from 'app/components/ui/form';

import Context, { AuthContext } from './Context';

/**
 * Helps with form fields binding and form serialization
 */

class BaseAuthBody extends React.Component<
    // TODO: this may be converted to generic type RouteComponentProps<T>
    RouteComponentProps<Record<string, any>>
> {
    static contextType = Context;
    declare context: React.ContextType<typeof Context>;
    prevErrors: AuthContext['auth']['error'];

    autoFocusField: string | null = '';

    componentDidMount() {
        this.prevErrors = this.context.auth.error;
    }

    componentDidUpdate() {
        if (this.context.auth.error !== this.prevErrors) {
            this.form.setErrors(this.context.auth.error || {});
        }

        this.prevErrors = this.context.auth.error;
    }

    onFormSubmit() {
        this.context.resolve(this.serialize());
    }

    form = new FormModel({
        renderErrors: false,
    });

    bindField(name: string) {
        return this.form.bindField(name);
    }

    serialize() {
        return this.form.serialize();
    }

    autoFocus() {
        const fieldId = this.autoFocusField;

        if (fieldId && this.form.hasField(fieldId)) {
            this.form.focus(fieldId);
        }
    }
}

export default BaseAuthBody;
