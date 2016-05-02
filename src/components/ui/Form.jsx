import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { intlShape } from 'react-intl';

import { uniqueId } from 'functions';

import icons from './icons.scss';
import styles from './form.scss';
import buttons from './buttons.scss';

export class Input extends Component {
    static displayName = 'Input';

    static propTypes = {
        placeholder: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]),
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired,
        error: PropTypes.string,
        icon: PropTypes.string,
        skin: PropTypes.oneOf(['dark', 'light']),
        color: PropTypes.oneOf(['green', 'blue', 'red', 'lightViolet', 'darkBlue'])
    };

    static contextTypes = {
        intl: intlShape.isRequired
    };

    render() {
        let { icon, color = 'green', skin = 'dark', error, label } = this.props;

        const props = {
            type: 'text',
            ...this.props
        };

        if (label) {
            if (!props.id) {
                props.id = uniqueId('input');
            }

            if (label.id) {
                label = this.context.intl.formatMessage(label);
            }

            label = (
                <label className={styles.textFieldLabel} htmlFor={props.id}>
                    {label}
                </label>
            );
        }

        if (props.placeholder && props.placeholder.id) {
            props.placeholder = this.context.intl.formatMessage(props.placeholder);
        }

        let baseClass = styles.formRow;
        if (icon) {
            baseClass = styles.formIconRow;
            icon = (
                <div className={classNames(styles.textFieldIcon, icons[icon])} />
            );
        }

        if (error) {
            error = (
                <div className={styles.fieldError}>
                    error
                </div>
            );
        }

        return (
            <div className={baseClass}>
                {label}
                <div className={styles.textFieldContainer}>
                    <input ref={this.setEl} className={classNames(
                        styles[`${skin}TextField`],
                        styles[`${color}TextField`]
                    )} {...props} />
                    {icon}
                </div>
                {error}
            </div>
        );
    }

    setEl = (el) => {
        this.el = el;
    };

    getValue() {
        return this.el.value;
    }

    focus() {
        this.el.focus();
        setTimeout(this.el.focus.bind(this.el), 10);
    }
}

export class Checkbox extends Component {
    static displayName = 'Checkbox';

    static propTypes = {
        color: PropTypes.oneOf(['green', 'blue', 'red']),
        skin: PropTypes.oneOf(['dark', 'light']),
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired
    };

    static contextTypes = {
        intl: intlShape.isRequired
    };

    render() {
        let { label, color = 'green', skin = 'dark' } = this.props;

        if (label && label.id) {
            label = this.context.intl.formatMessage(label);
        }

        return (
            <div className={classNames(styles[`${color}CheckboxRow`], styles[`${skin}CheckboxRow`])}>
                <label className={styles.checkboxContainer}>
                    <input ref={this.setEl} className={styles.checkboxInput} type="checkbox" {...this.props} />
                    <div className={styles.checkbox} />
                    {label}
                </label>
            </div>
        );
    }

    setEl = (el) => {
        this.el = el;
    };

    getValue() {
        return this.el.checked ? 1 : 0;
    }

    focus() {
        this.el.focus();
    }
}


export class Button extends Component {
    static displayName = 'Button';

    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired,
        block: PropTypes.bool,
        color: PropTypes.oneOf(['green', 'blue', 'red', 'lightViolet', 'darkBlue'])
    };

    static contextTypes = {
        intl: intlShape.isRequired
    };

    render() {
        const { color = 'green', block } = this.props;

        const props = {
            ...this.props
        };

        if (props.label.id) {
            props.label = this.context.intl.formatMessage(props.label);
        }

        return (
            <button className={classNames(buttons[color], {
                [buttons.block]: block
            })} {...props}>
                {props.label}
            </button>
        );
    }
}

export class Form extends Component {
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
