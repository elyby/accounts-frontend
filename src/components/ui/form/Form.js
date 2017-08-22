// @flow
import React, { Component } from 'react';

import classNames from 'classnames';

import logger from 'services/logger';

import styles from './form.scss';

import type FormModel from './FormModel';

type Props = {
    id: string,
    isLoading: bool,
    form?: FormModel,
    onSubmit: Function,
    onInvalid: (errors: {[errorKey: string]: string}) => void,
    children: *
};
type State = {
    isTouched: bool,
    isLoading: bool
};
type InputElement = HTMLInputElement|HTMLTextAreaElement;

export default class Form extends Component<Props, State> {
    static defaultProps = {
        id: 'default',
        isLoading: false,
        onSubmit() {},
        onInvalid() {}
    };

    state = {
        isTouched: false,
        isLoading: this.props.isLoading || false
    };

    formEl: ?HTMLFormElement;

    componentWillMount() {
        if (this.props.form) {
            this.props.form.addLoadingListener(this.onLoading);
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                isTouched: false
            });
        }

        if (typeof nextProps.isLoading !== 'undefined'
            && nextProps.isLoading !== this.state.isLoading
        ) {
            this.setState({
                isLoading: nextProps.isLoading
            });
        }

        const nextForm = nextProps.form;
        if (nextForm
            && this.props.form
            && nextForm !== this.props.form
        ) {
            this.props.form.removeLoadingListener(this.onLoading);
            nextForm.addLoadingListener(this.onLoading);
        }
    }

    componentWillUnmount() {
        if (this.props.form) {
            this.props.form.removeLoadingListener(this.onLoading);
        }
    }

    render() {
        const {isLoading} = this.state;

        return (
            <form
                className={classNames(
                    styles.form,
                    {
                        [styles.isFormLoading]: isLoading,
                        [styles.formTouched]: this.state.isTouched
                    }
                )}
                onSubmit={this.onFormSubmit}
                ref={(el: ?HTMLFormElement) => this.formEl = el}
                noValidate
            >
                {this.props.children}
            </form>
        );
    }

    submit() {
        if (!this.state.isTouched) {
            this.setState({
                isTouched: true
            });
        }

        const form = this.formEl;

        if (!form) {
            return;
        }

        if (form.checkValidity()) {
            Promise.resolve(this.props.onSubmit(
                this.props.form ? this.props.form : new FormData(form)
            ))
            .catch((errors: {[key: string]: string}) => {
                this.setErrors(errors);
            });
        } else {
            const invalidEls = form.querySelectorAll(':invalid');
            const errors = {};
            invalidEls[0].focus(); // focus on first error

            Array.from(invalidEls).reduce((errors, el: InputElement) => {
                if (!el.name) {
                    logger.warn('Found an element without name', {el});

                    return errors;
                }

                let errorMessage = el.validationMessage;
                if (el.validity.valueMissing) {
                    errorMessage = `error.${el.name}_required`;
                } else if (el.validity.typeMismatch) {
                    errorMessage = `error.${el.name}_invalid`;
                }

                errors[el.name] = errorMessage;

                return errors;
            }, errors);

            this.setErrors(errors);
        }
    }

    setErrors(errors: {[key: string]: string}) {
        this.props.form && this.props.form.setErrors(errors);
        this.props.onInvalid(errors);
    }

    onFormSubmit = (event: Event) => {
        event.preventDefault();

        this.submit();
    };

    onLoading = (isLoading: bool) => this.setState({isLoading});
}
