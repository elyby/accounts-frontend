// @flow
import type { MessageDescriptor } from 'react-intl';
import React from 'react';
import classNames from 'classnames';
import buttons from 'components/ui/buttons.scss';
import { COLOR_GREEN } from 'components/ui';

import type { Color } from 'components/ui';
import FormComponent from './FormComponent';

export default class Button extends FormComponent<{
    label: string | MessageDescriptor,
    block: bool,
    small: bool,
    loading: bool,
    className: string,
    color: Color
}> {
    static defaultProps = {
        color: COLOR_GREEN
    };

    render() {
        const {
            color,
            block,
            small,
            className,
            loading,
            label,
            ...restProps
        } = this.props;

        return (
            <button
                className={classNames(buttons[color], {
                    [buttons.loading]: loading,
                    [buttons.block]: block,
                    [buttons.smallButton]: small
                }, className)}
                {...restProps}
            >
                {this.formatMessage(label)}
            </button>
        );
    }
}
