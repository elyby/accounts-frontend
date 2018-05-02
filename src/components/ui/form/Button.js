// @flow
import type { MessageDescriptor } from 'react-intl';
import type { ComponentType } from 'react';
import type { Color } from 'components/ui';
import React from 'react';
import classNames from 'classnames';
import buttons from 'components/ui/buttons.scss';
import { COLOR_GREEN } from 'components/ui';

import FormComponent from './FormComponent';

export default class Button extends FormComponent<{
    label: string | MessageDescriptor,
    block?: bool,
    small?: bool,
    loading?: bool,
    className?: string,
    color: Color,
    disabled?: bool,
    component: string | ComponentType<any>,
}> {
    static defaultProps = {
        color: COLOR_GREEN,
        component: 'button',
    };

    render() {
        const {
            color,
            block,
            small,
            disabled,
            className,
            loading,
            label,
            component: ComponentProp,
            ...restProps
        } = this.props;

        return (
            <ComponentProp
                className={classNames(buttons[color], {
                    [buttons.loading]: loading,
                    [buttons.block]: block,
                    [buttons.smallButton]: small,
                    [buttons.disabled]: disabled,
                }, className)}
                disabled={disabled}
                {...restProps}
            >
                {this.formatMessage(label)}
            </ComponentProp>
        );
    }
}
