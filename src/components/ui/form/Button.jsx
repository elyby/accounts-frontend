import React, { PropTypes } from 'react';

import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import { colors, COLOR_GREEN } from 'components/ui';
import { omit } from 'functions';

import FormComponent from './FormComponent';

export default class Button extends FormComponent {
    static displayName = 'Button';

    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired,
        block: PropTypes.bool,
        small: PropTypes.bool,
        color: PropTypes.oneOf(colors),
        className: PropTypes.string
    };

    static defaultProps = {
        color: COLOR_GREEN
    };

    render() {
        const { color, block, small, className } = this.props;

        const props = omit(this.props, Object.keys(Button.propTypes));

        const label = this.formatMessage(this.props.label);

        return (
            <button className={classNames(buttons[color], {
                [buttons.block]: block,
                [buttons.smallButton]: small
            }, className)}
                {...props}
            >
                {label}
            </button>
        );
    }
}
