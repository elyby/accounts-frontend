import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';

import styles from './form.scss';

export default class Form extends Component {
    static displayName = 'Form';

    static propTypes = {
        id: PropTypes.string, // and id, that uniquely identifies form contents
        isLoading: PropTypes.bool,
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
        isTouched: false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                isTouched: false
            });
        }
    }

    render() {
        const {isLoading} = this.props;

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
            const firstError = form.querySelectorAll(':invalid')[0];
            firstError.focus();

            let errorMessage = firstError.validationMessage;
            if (firstError.validity.valueMissing) {
                errorMessage = `error.${firstError.name}_required`;
            } else if (firstError.validity.typeMismatch) {
                errorMessage = `error.${firstError.name}_invalid`;
            }

            this.props.onInvalid(errorMessage);
        }
    };
}
