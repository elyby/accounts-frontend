import React from 'react';
import { MessageDescriptor } from 'react-intl';
import clsx from 'clsx';
import { uniqueId, omit } from 'app/functions';
import copy from 'app/services/copy';
import icons from 'app/components/ui/icons.scss';
import { SKIN_DARK, COLOR_GREEN, Skin, Color } from 'app/components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

let copiedStateTimeout: NodeJS.Timeout;

export default class Input extends FormInputComponent<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
    skin: Skin;
    color: Color;
    center: boolean;
    disabled: boolean;
    label?: string | MessageDescriptor;
    placeholder?: string | MessageDescriptor;
    error?: string | { type: string; payload: string };
    icon?: string;
    copy?: boolean;
  },
  {
    wasCopied: boolean;
  }
> {
  static defaultProps = {
    color: COLOR_GREEN,
    skin: SKIN_DARK,
    center: false,
    disabled: false,
  };

  state = {
    wasCopied: false,
  };

  elRef = React.createRef<HTMLInputElement>();

  render() {
    const {
      color,
      skin,
      center,
      icon: iconType,
      copy: showCopyIcon,
      placeholder: placeholderText,
    } = this.props;
    let { label: labelContent } = this.props;
    const { wasCopied } = this.state;
    let placeholder: string | undefined;

    const props = omit(
      {
        type: 'text',
        ...this.props,
      },
      [
        'label',
        'placeholder',
        'error',
        'skin',
        'color',
        'center',
        'icon',
        'copy',
      ],
    );

    let label: React.ReactElement | null = null;
    let copyIcon: React.ReactElement | null = null;
    let icon: React.ReactElement | null = null;

    if (labelContent) {
      if (!props.id) {
        props.id = uniqueId('input');
      }

      labelContent = this.formatMessage(labelContent);

      label = (
        <label className={styles.textFieldLabel} htmlFor={props.id}>
          {labelContent}
        </label>
      );
    }

    if (placeholderText) {
      placeholder = this.formatMessage(placeholderText);
    }

    let baseClass = styles.formRow;

    if (iconType) {
      baseClass = styles.formIconRow;
      icon = <span className={clsx(styles.textFieldIcon, icons[iconType])} />;
    }

    if (showCopyIcon) {
      copyIcon = (
        <div
          className={clsx(styles.copyIcon, {
            [icons.clipboard]: !wasCopied,
            [icons.checkmark]: wasCopied,
            [styles.copyCheckmark]: wasCopied,
          })}
          onClick={this.onCopy}
        />
      );
    }

    return (
      <div className={baseClass}>
        {label}
        <div className={styles.textFieldContainer}>
          <input
            ref={this.elRef}
            className={clsx(
              styles[`${skin}TextField`],
              styles[`${color}TextField`],
              {
                [styles.textFieldCenter]: center,
              },
            )}
            placeholder={placeholder}
            {...props}
          />
          {icon}
          {copyIcon}
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

  onCopy = async () => {
    const value = this.getValue();

    if (!value) {
      return;
    }

    try {
      clearTimeout(copiedStateTimeout);
      copiedStateTimeout = setTimeout(
        () => this.setState({ wasCopied: false }),
        2000,
      );

      await copy(value);
      this.setState({ wasCopied: true });
    } catch (err) {
      // it's okay
    }
  };
}
