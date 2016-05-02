import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { intlShape } from 'react-intl';

import { uniqueId } from 'functions';
import icons from 'components/ui/icons.scss';

import styles from './form.scss';

export default class Input extends Component {
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
