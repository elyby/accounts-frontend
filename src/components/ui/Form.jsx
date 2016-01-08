import React from 'react';

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
