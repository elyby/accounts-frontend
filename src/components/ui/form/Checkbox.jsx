import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { intlShape } from 'react-intl';

import styles from './form.scss';

export default class Checkbox extends Component {
    static displayName = 'Checkbox';

    static propTypes = {
        color: PropTypes.oneOf(['green', 'blue', 'red']),
        skin: PropTypes.oneOf(['dark', 'light']),
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired
    };

    static contextTypes = {
        intl: intlShape.isRequired
    };

    render() {
        let { label, color = 'green', skin = 'dark' } = this.props;

        if (label && label.id) {
            label = this.context.intl.formatMessage(label);
        }

        return (
            <div className={classNames(styles[`${color}CheckboxRow`], styles[`${skin}CheckboxRow`])}>
                <label className={styles.checkboxContainer}>
                    <input ref={this.setEl} className={styles.checkboxInput} type="checkbox" {...this.props} />
                    <div className={styles.checkbox} />
                    {label}
                </label>
            </div>
        );
    }

    setEl = (el) => {
        this.el = el;
    };

    getValue() {
        return this.el.checked ? 1 : 0;
    }

    focus() {
        this.el.focus();
    }
}
