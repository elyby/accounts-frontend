/**
 * Helps with form fields binding, form serialization and errors rendering
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import AuthError from 'components/auth/authError/AuthError';
import { userShape } from 'components/user/User';
import { FormModel } from 'components/ui/form';

export default class BaseAuthBody extends Component {
    static contextTypes = {
        clearErrors: PropTypes.func.isRequired,
        resolve: PropTypes.func.isRequired,
        requestRedraw: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
                type: PropTypes.string,
                payload: PropTypes.object
            })]),
            scopes: PropTypes.array
        }).isRequired,
        user: userShape
    };

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextContext.auth.error !== this.context.auth.error) {
            this.form.setErrors(nextContext.auth.error || {});
        }
    }

    renderErrors() {
        return this.form.hasErrors()
            ? <AuthError error={this.form.getFirstError()} onClose={this.onClearErrors} />
            : null
            ;
    }

    onFormSubmit() {
        this.context.resolve(this.serialize());
    }

    onClearErrors = this.context.clearErrors;

    form = new FormModel({
        renderErrors: false
    });

    bindField = this.form.bindField.bind(this.form);

    serialize() {
        return this.form.serialize();
    }

    autoFocus() {
        const fieldId = this.autoFocusField;

        fieldId && this.form.focus(fieldId);
    }
}
