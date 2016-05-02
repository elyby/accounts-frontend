import React, { PropTypes } from 'react';

import classNames from 'classnames';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Checkbox extends FormInputComponent {
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

    render() {
        let { label, color = 'green', skin = 'dark' } = this.props;

        label = this.formatMessage(label);

        return (
            <div className={classNames(styles[`${color}CheckboxRow`], styles[`${skin}CheckboxRow`])}>
                <label className={styles.checkboxContainer}>
                    <input ref={this.setEl} className={styles.checkboxInput} type="checkbox" {...this.props} />
                    <div className={styles.checkbox} />
                    {label}
                </label>
                {this.renderError()}
            </div>
        );
    }

    getValue() {
        return this.el.checked ? 1 : 0;
    }

    focus() {
        this.el.focus();
    }
}
