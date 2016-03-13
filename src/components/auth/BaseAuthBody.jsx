/**
 * Helps with form fields binding, form serialization and errors rendering
 */
import React, { Component, PropTypes } from 'react';

import AuthError from './AuthError';
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

    /**
     * Fixes some issues with scroll, when input beeing focused
     *
     * When an element is focused, by default browsers will scroll its parents to display
     * focused item to user. This behavior may cause unexpected visual effects, when
     * you animating apearing of an input (e.g. transform) and auto focusing it. In
     * that case the browser will scroll the parent container so that input will be
     * visible.
     * This method will fix that issue by finding parent with overflow: hidden and
     * reseting its scrollLeft value to 0.
     *
     * Usage:
     * <input autoFocus onFocus={this.fixAutoFocus} />
     *
     * @param {Object} event
     */
    fixAutoFocus = (event) => {
        let el = event.target;

        while (el.parentNode) {
            el = el.parentNode;

            if (getComputedStyle(el).overflow === 'hidden') {
                el.scrollLeft = 0;
                break;
            }
        }
    };

    serialize() {
        return Object.keys(this.form).reduce((acc, key) => {
            acc[key] = this.form[key].getValue();

            return acc;
        }, {});
    }
}
