import React, { Component } from 'react';

import classNames from 'classnames';

import icons from './icons.scss';
import styles from './form.scss';

export function Input(props) {
    var { icon, color = 'green' } = props;

    props = {
        type: 'text',
        ...props
    };

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

export class Checkbox extends Component {
    displayName = 'Checkbox';

    render() {
        var { label, color = 'green' } = this.props;

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
}
