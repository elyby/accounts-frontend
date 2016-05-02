import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { intlShape } from 'react-intl';

import buttons from 'components/ui/buttons.scss';

export default class Button extends Component {
    static displayName = 'Button';

    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired,
        block: PropTypes.bool,
        color: PropTypes.oneOf(['green', 'blue', 'red', 'lightViolet', 'darkBlue'])
    };

    static contextTypes = {
        intl: intlShape.isRequired
    };

    render() {
        const { color = 'green', block } = this.props;

        const props = {
            ...this.props
        };

        if (props.label.id) {
            props.label = this.context.intl.formatMessage(props.label);
        }

        return (
            <button className={classNames(buttons[color], {
                [buttons.block]: block
            })} {...props}>
                {props.label}
            </button>
        );
    }
}
