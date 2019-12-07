import React from 'react';
import { MessageDescriptor } from 'react-intl';
import clsx from 'clsx';
import { SKIN_DARK, COLOR_GREEN, Color, Skin } from 'app/components/ui';
import { omit } from 'app/functions';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Checkbox extends FormInputComponent<{
  color: Color;
  skin: Skin;
  label: string | MessageDescriptor;
}> {
  static defaultProps = {
    color: COLOR_GREEN,
    skin: SKIN_DARK,
  };

  elRef = React.createRef<HTMLInputElement>();

  render() {
    const { color, skin } = this.props;
    let { label } = this.props;

    label = this.formatMessage(label);

    const props = omit(this.props, ['color', 'skin', 'label']);

    return (
      <div
        className={clsx(
          styles[`${color}MarkableRow`],
          styles[`${skin}MarkableRow`],
        )}
      >
        <label className={styles.markableContainer}>
          <input
            ref={this.elRef}
            className={styles.markableInput}
            type="checkbox"
            {...props}
          />
          <div className={styles.checkbox} />
          {label}
        </label>
        {this.renderError()}
      </div>
    );
  }

  getValue() {
    const { current: el } = this.elRef;

    return el && el.checked ? 1 : 0;
  }

  focus() {
    const { current: el } = this.elRef;

    el && el.focus();
  }
}
