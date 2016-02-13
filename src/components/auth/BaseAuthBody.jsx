/**
 * Helps with form fields binding, form serialization and errors rendering
 */
import React, { Component, PropTypes } from 'react';

import AuthError from './AuthError';

export default class BaseAuthBody extends Component {
    static propTypes = {
        clearErrors: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string
        })
    };

    renderErrors() {
        return this.props.auth.error
            ? <AuthError error={this.props.auth.error} onClose={this.onClearErrors} />
            : ''
            ;
    }

    onClearErrors = this.props.clearErrors;

    form = {};

    bindField(name) {
        return {
            name,
            ref: (el) => {
                this.form[name] = el;
            }
        };
    }

    serialize() {
        return Object.keys(this.form).reduce((acc, key) => {
            acc[key] = this.form[key].getValue();

            return acc;
        }, {});
    }
}
