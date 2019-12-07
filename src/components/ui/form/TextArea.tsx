import React from 'react';
import { MessageDescriptor } from 'react-intl';
import TextareaAutosize from 'react-textarea-autosize';
import classNames from 'classnames';
import { uniqueId, omit } from 'functions';
import { SKIN_DARK, COLOR_GREEN, Skin, Color } from 'components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

type TextareaAutosizeProps = {
  onHeightChange?: (number, TextareaAutosizeProps) => void;
  useCacheForDOMMeasurements?: boolean;
  minRows?: number;
  maxRows?: number;
  inputRef?: (el?: HTMLTextAreaElement) => void;
};

export default class TextArea extends FormInputComponent<
  {
    placeholder?: string | MessageDescriptor;
    label?: string | MessageDescriptor;
    error?: string;
    skin: Skin;
    color: Color;
  } & TextareaAutosizeProps &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
> {
  static defaultProps = {
    color: COLOR_GREEN,
    skin: SKIN_DARK,
  };

  elRef = React.createRef<HTMLTextAreaElement>();

  render() {
    const {
      color,
      skin,
      label: labelText,
      placeholder: placeholderText,
    } = this.props;
    let label: React.ReactElement | undefined;
    let placeholder: string | undefined;

    const props = omit(
      {
        type: 'text',
        ...this.props,
      },
      ['label', 'placeholder', 'error', 'skin', 'color'],
    );

    if (labelText) {
      if (!props.id) {
        props.id = uniqueId('textarea');
      }

      label = (
        <label className={styles.textFieldLabel} htmlFor={props.id}>
          {this.formatMessage(labelText)}
        </label>
      );
    }

    if (placeholderText) {
      placeholder = this.formatMessage(placeholderText);
    }

    return (
      <div className={styles.formRow}>
        {label}
        <div className={styles.textAreaContainer}>
          <TextareaAutosize
            inputRef={this.elRef}
            className={classNames(
              styles.textArea,
              styles[`${skin}TextField`],
              styles[`${color}TextField`],
            )}
            placeholder={placeholder}
            {...props}
          />
        </div>
        {this.renderError()}
      </div>
    );
  }

  getValue() {
    const { current: el } = this.elRef;

    return el && el.value;
  }

  focus() {
    const { current: el } = this.elRef;

    if (!el) {
      return;
    }

    el.focus();
    setTimeout(el.focus.bind(el), 10);
  }
}
