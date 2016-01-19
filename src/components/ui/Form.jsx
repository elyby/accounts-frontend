import React, { Component } from 'react';

import classNames from 'classnames';
import {injectIntl, intlShape} from 'react-intl';

import icons from './icons.scss';
import styles from './form.scss';

function Input(props) {
    var { icon, color = 'green' } = props;

    props = {
        type: 'text',
        ...props
    };

    if (props.placeholder && props.placeholder.id) {
        props.placeholder = props.intl.formatMessage(props.placeholder);
    }

    var baseClass = styles.formRow;
    if (icon) {
        baseClass = styles.formIconRow;
        icon = (
            <div className={classNames(styles.formFieldIcon, icons[icon])} />
        );
    }

    return (
        <div className={baseClass}>
            <input className={styles[`${color}TextField`]} {...props} />
            {icon}
        </div>
    );
}

Input.displayName = 'Input';
Input.propTypes = {
    intl: intlShape.isRequired
};

const IntlInput = injectIntl(Input);

export {IntlInput as Input};

export function Checkbox(props) {
    var { label, color = 'green' } = props;

    return (
        <div className={styles[`${color}CheckboxRow`]}>
            <label className={styles.checkboxContainer}>
                <input className={styles.checkboxInput} type="checkbox" />
                <div className={styles.checkbox} />
                {label}
            </label>
        </div>
    );
}

Checkbox.displayName = 'Checkbox';
