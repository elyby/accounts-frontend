import React from 'react';
import { MessageDescriptor } from 'react-intl';
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';
import clsx from 'clsx';
import { uniqueId, omit } from 'app/functions';
import { SKIN_DARK, COLOR_GREEN, Skin, Color } from 'app/components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

interface OwnProps {
  placeholder?: string | MessageDescriptor;
  label?: string | MessageDescriptor;
  skin: Skin;
  color: Color;
}

export default class TextArea extends FormInputComponent<
  OwnProps & Omit<TextareaAutosizeProps, keyof OwnProps>
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
            className={clsx(
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
