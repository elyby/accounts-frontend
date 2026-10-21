import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

import { Skin, Color, COLOR_GREEN, SKIN_DARK } from 'app/components/ui';

import styles from './markable.scss';

export interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    type: 'checkbox' | 'radio';
    skin?: Skin;
    color?: Color;
    label?: ReactNode;
}

/**
 * The common implementation of the Checkbox and the Radio
 */
const Markable = forwardRef<HTMLInputElement, Props>(({ type, color = COLOR_GREEN, skin = SKIN_DARK, label, className, ...inputProps }, ref) => {
    const mark = (
        <span className={clsx(styles.markable, styles[`${color}Markable`], !label && className)}>
            <input ref={ref} className={styles.input} type={type} {...inputProps} />
            <span className={clsx(styles.mark, { [styles.radio]: type === 'radio' })} />
        </span>
    );

    if (!label) {
        return mark;
    }

    return (
        <label className={clsx(styles.label, styles[`${skin}Label`], className)}>
            {mark}
            <span>{label}</span>
        </label>
    );
});

Markable.displayName = 'Markable';

export default Markable;
