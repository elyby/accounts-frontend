/**
 * Helps with form fields binding, form serialization and errors rendering
 */
import React, { Component, PropTypes } from 'react';

import AuthError from 'components/auth/authError/AuthError';
import { userShape } from 'components/user/User';

export default class BaseAuthBody extends Component {
    static contextTypes = {
        clearErrors: PropTypes.func.isRequired,
        resolve: PropTypes.func.isRequired,
        reject: PropTypes.func.isRequired,
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

    form = {};

    bindField(name) {
        return {
            name,
            ref: (el) => {
                this.form[name] = el;
            }
        };
    }

    autoFocus() {
        const fieldId = this.autoFocusField;

        fieldId && this.form[fieldId] && this.form[fieldId].focus();
    }

    serialize() {
        return Object.keys(this.form).reduce((acc, key) => {
            acc[key] = this.form[key].getValue();

            return acc;
        }, {});
    }
}
