import React from 'react';
import { MessageDescriptor } from 'react-intl';
import classNames from 'classnames';
import { SKIN_DARK, COLOR_GREEN } from 'app/components/ui';
import { omit } from 'app/functions';
import { Color, Skin } from 'app/components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Radio extends FormInputComponent<
  {
    color: Color;
    skin: Skin;
    label: string | MessageDescriptor;
  } & React.InputHTMLAttributes<HTMLInputElement>
> {
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
        className={classNames(
          styles[`${color}MarkableRow`],
          styles[`${skin}MarkableRow`],
        )}
      >
        <label className={styles.markableContainer}>
          <input
            ref={this.elRef}
            className={styles.markableInput}
            type="radio"
            {...props}
          />
          <div className={styles.radio} />
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
