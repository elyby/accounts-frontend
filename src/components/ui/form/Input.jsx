import React, { PropTypes } from 'react';

import classNames from 'classnames';

import { uniqueId } from 'functions';
import icons from 'components/ui/icons.scss';
import { colors, skins, SKIN_DARK, COLOR_GREEN } from 'components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Input extends FormInputComponent {
    static displayName = 'Input';

    static propTypes = {
        placeholder: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]),
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]),
        error: PropTypes.string,
        icon: PropTypes.string,
        skin: PropTypes.oneOf(skins),
        color: PropTypes.oneOf(colors),
        center: PropTypes.bool
    };

    static defaultProps = {
        color: COLOR_GREEN,
        skin: SKIN_DARK
    };

    render() {
        const { color, skin, center } = this.props;
        let { icon, label } = this.props;

        const props = {
            type: 'text',
            ...this.props
        };

        if (label) {
            if (!props.id) {
                props.id = uniqueId('input');
            }

            label = this.formatMessage(label);

            label = (
                <label className={styles.textFieldLabel} htmlFor={props.id}>
                    {label}
                </label>
            );
        }

        props.placeholder = this.formatMessage(props.placeholder);

        let baseClass = styles.formRow;
        if (icon) {
            baseClass = styles.formIconRow;
            icon = (
                <span className={classNames(styles.textFieldIcon, icons[icon])} />
            );
        }

        return (
            <div className={baseClass}>
                {label}
                <div className={styles.textFieldContainer}>
                    <input ref={this.setEl}
                        className={classNames(
                            styles[`${skin}TextField`],
                            styles[`${color}TextField`],
                            {
                                [styles.textFieldCenter]: center
                            }
                        )}
                        {...props}
                    />
                    {icon}
                </div>
                {this.renderError()}
            </div>
        );
    }

    getValue() {
        return this.el.value;
    }

    focus() {
        this.el.focus();
        setTimeout(this.el.focus.bind(this.el), 10);
    }
}
