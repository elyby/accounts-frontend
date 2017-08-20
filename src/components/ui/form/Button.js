// @flow
import React from 'react';

import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import { COLOR_GREEN } from 'components/ui';

import FormComponent from './FormComponent';

import type { Color } from 'components/ui';

export default class Button extends FormComponent {
    props: {
        label: string | {id: string},
        block: bool,
        small: bool,
        loading: bool,
        className: string,
        color: Color
    };

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
            <button className={classNames(buttons[color], {
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
