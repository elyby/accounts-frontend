import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';

import logger from 'services/logger';

import FormModel from './FormModel';
import styles from './form.scss';

export default class Form extends Component {
    static displayName = 'Form';

    static propTypes = {
        id: PropTypes.string, // and id, that uniquely identifies form contents
        isLoading: PropTypes.bool,
        form: PropTypes.instanceOf(FormModel),
        onSubmit: PropTypes.func,
        onInvalid: PropTypes.func,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node
        ])
    };

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

    componentWillMount() {
        if (this.props.form) {
            this.props.form.addLoadingListener(this.onLoading);
        }
    }

    componentWillReceiveProps(nextProps) {
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

        if (nextProps.form && this.props.form && nextProps.form !== this.props.form) {
            this.props.form.removeLoadingListener(this.onLoading);
            nextProps.form.addLoadingListener(this.onLoading);
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
                noValidate
            >
                {this.props.children}
            </form>
        );
    }

    onFormSubmit = (event) => {
        event.preventDefault();

        if (!this.state.isTouched) {
            this.setState({
                isTouched: true
            });
        }

        const form = event.currentTarget;

        if (form.checkValidity()) {
            this.props.onSubmit();
        } else {
            const invalidEls = form.querySelectorAll(':invalid');
            const errors = {};
            invalidEls[0].focus(); // focus on first error

            Array.from(invalidEls).reduce((errors, el) => {
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

            this.props.form && this.props.form.setErrors(errors);
            this.props.onInvalid(errors);
        }
    };

    onLoading = (isLoading) => this.setState({isLoading});
}
