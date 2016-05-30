import React, { PropTypes } from 'react';

import classNames from 'classnames';

import { uniqueId } from 'functions';
import { colors, skins, SKIN_DARK, COLOR_GREEN } from 'components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class TextArea extends FormInputComponent {
    static displayName = 'TextArea';

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
        skin: PropTypes.oneOf(skins),
        color: PropTypes.oneOf(colors)
    };

    static defaultProps = {
        color: COLOR_GREEN,
        skin: SKIN_DARK
    };

    render() {
        const { color, skin } = this.props;
        let { label } = this.props;

        const props = {
            type: 'text',
            ...this.props
        };

        if (label) {
            if (!props.id) {
                props.id = uniqueId('textarea');
            }

            label = this.formatMessage(label);

            label = (
                <label className={styles.textFieldLabel} htmlFor={props.id}>
                    {label}
                </label>
            );
        }

        props.placeholder = this.formatMessage(props.placeholder);

        return (
            <div className={styles.formRow}>
                {label}
                <div className={styles.textAreaContainer}>
                    <textarea ref={this.setEl}
                        className={classNames(
                            styles.textArea,
                            styles[`${skin}TextField`],
                            styles[`${color}TextField`]
                        )}
                        {...props}
                    />
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
