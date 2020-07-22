import React, { ComponentType } from 'react';
import clsx from 'clsx';

import { COLOR_GREEN } from 'app/components/ui';
import { Color } from 'app/components/ui';

import buttons from '../buttons.scss';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    block?: boolean;
    small?: boolean;
    loading?: boolean;
    className?: string;
    color?: Color;
    disabled?: boolean;
    component?: string | React.ComponentType<any>;
}

const Button: ComponentType<Props> = ({
    color = COLOR_GREEN,
    block,
    small,
    disabled,
    className,
    loading,
    component: ComponentProp = 'button',
    ...restProps
}) => (
    <ComponentProp
        className={clsx(
            buttons[color],
            {
                [buttons.loading]: loading,
                [buttons.block]: block,
                [buttons.smallButton]: small,
                [buttons.disabled]: disabled,
            },
            className,
        )}
        disabled={disabled}
        {...restProps}
    />
);

export default Button;
