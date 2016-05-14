/**
 * Helps with form fields binding, form serialization and errors rendering
 */
import React, { Component, PropTypes } from 'react';

import AuthError from 'components/auth/authError/AuthError';
import { userShape } from 'components/user/User';
import { FormModel } from 'components/ui/form';

export default class BaseAuthBody extends Component {
    static contextTypes = {
        clearErrors: PropTypes.func.isRequired,
        resolve: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string,
            scopes: PropTypes.array
        }),
        user: userShape
    };

    renderErrors() {
        return this.context.auth.error
            ? <AuthError error={this.context.auth.error} onClose={this.onClearErrors} />
            : ''
            ;
    }

    onFormSubmit() {
        this.context.resolve(this.serialize());
    }

    onClearErrors = this.context.clearErrors;

    form = new FormModel();

    bindField = this.form.bindField.bind(this.form);
    serialize = this.form.serialize.bind(this.form);

    autoFocus() {
        const fieldId = this.autoFocusField;

        fieldId && this.form.focus(fieldId);
    }
}
