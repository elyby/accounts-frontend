import React, { Component } from 'react';

import classNames from 'classnames';

import icons from './icons.scss';
import styles from './form.scss';

export function Input(props) {
    props = {
        type: 'text',
        ...props
    };

    var baseClass = styles.formRow;
    var icon;
    if (props.icon) {
        baseClass = styles.formIconRow;
        icon = (
            <div className={classNames(styles.formFieldIcon, icons[props.icon])} />
        );
    }

    return (
        <div className={baseClass}>
            <input className={styles.textField} {...props} />
            {icon}
        </div>
    );
}

export class Checkbox extends Component {
    displayName = 'Checkbox';

    render() {
        var { label } = this.props;

        return (
            <div className={styles.checkboxRow}>
                <label className={styles.checkboxContainer}>
                    <input className={styles.checkboxInput} type="checkbox" />
                    <div className={styles.checkbox} />
                    {label}
                </label>
            </div>
        );
    }
}
