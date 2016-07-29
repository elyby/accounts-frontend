import React, { PropTypes } from 'react';

import classNames from 'classnames';

import { colors, skins, SKIN_DARK, COLOR_GREEN } from 'components/ui';
import { omit } from 'functions';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Checkbox extends FormInputComponent {
    static displayName = 'Checkbox';

    static propTypes = {
        color: PropTypes.oneOf(colors),
        skin: PropTypes.oneOf(skins),
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired
    };

    static defaultProps = {
        color: COLOR_GREEN,
        skin: SKIN_DARK
    };

    render() {
        const { color, skin } = this.props;
        let { label } = this.props;

        label = this.formatMessage(label);

        const props = omit(this.props, Object.keys(Checkbox.propTypes));

        return (
            <div className={classNames(styles[`${color}CheckboxRow`], styles[`${skin}CheckboxRow`])}>
                <label className={styles.checkboxContainer}>
                    <input ref={this.setEl} className={styles.checkboxInput} type="checkbox" {...props} />
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
