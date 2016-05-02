import React, { PropTypes } from 'react';

import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';

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
        color: PropTypes.oneOf(['green', 'blue', 'red', 'lightViolet', 'darkBlue', 'violet'])
    };

    render() {
        const { color = 'green', block } = this.props;

        const props = {
            ...this.props
        };

        props.label = this.formatMessage(props.label);

        return (
            <button className={classNames(buttons[color], {
                [buttons.block]: block
            })} {...props}>
                {props.label}
            </button>
        );
    }
}
