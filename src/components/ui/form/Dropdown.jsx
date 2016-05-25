import React, { PropTypes } from 'react';

import classNames from 'classnames';

import styles from 'components/ui/dropdown.scss';

import FormComponent from './FormComponent';

export default class Dropdown extends FormComponent {
    static displayName = 'Dropdown';

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
            <div className={classNames(styles[color], {
                [styles.block]: block
            })} {...props}>
                {props.label}
                <span className={styles.toggleIcon} />
            </div>
        );
    }
}
