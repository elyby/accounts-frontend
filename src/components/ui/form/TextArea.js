// @flow
import type { Skin, Color } from 'components/ui';
import type { MessageDescriptor } from 'react-intl';
import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import classNames from 'classnames';
import { uniqueId, omit } from 'functions';
import { SKIN_DARK, COLOR_GREEN } from 'components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

type TextareaAutosizeProps = {
    onHeightChange?: (number, TextareaAutosizeProps) => void,
    useCacheForDOMMeasurements?: bool,
    minRows?: number,
    maxRows?: number,
    inputRef?: (?HTMLTextAreaElement) => void,
};

export default class TextArea extends FormInputComponent<{
    placeholder?: string | MessageDescriptor,
    label?: string | MessageDescriptor,
    error?: string,
    skin: Skin,
    color: Color,
} & TextareaAutosizeProps> {
    static defaultProps = {
        color: COLOR_GREEN,
        skin: SKIN_DARK,
    };

    render() {
        const { color, skin } = this.props;
        let { label } = this.props;

        const props = omit({
            type: 'text',
            ...this.props,
        }, ['label', 'error', 'skin', 'color']);

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
                    <TextareaAutosize inputRef={this.setEl}
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
