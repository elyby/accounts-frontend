import React from 'react';
import classNames from 'classnames';
import buttons from 'app/components/ui/buttons.scss';
import { COLOR_GREEN } from 'app/components/ui';
import { MessageDescriptor } from 'react-intl';
import { Color } from 'app/components/ui';

import FormComponent from './FormComponent';

export default class Button extends FormComponent<
  {
    // TODO: drop MessageDescriptor support. It should be React.ReactNode only
    label: string | MessageDescriptor | React.ReactElement;
    block?: boolean;
    small?: boolean;
    loading?: boolean;
    className?: string;
    color?: Color;
    disabled?: boolean;
    component?: string | React.ComponentType<any>;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
> {
  render() {
    const {
      color = COLOR_GREEN,
      block,
      small,
      disabled,
      className,
      loading,
      label,
      component: ComponentProp = 'button',
      ...restProps
    } = this.props;

    return (
      <ComponentProp
        className={classNames(
          buttons[color],
          {
            [buttons.loading]: loading,
            [buttons.block]: block,
            [buttons.smallButton]: small,
            [buttons.disabled]: disabled,
          },
          className,
        )}
        disabled={disabled}
        {...restProps}
      >
        {typeof label === 'object' && React.isValidElement(label)
          ? label
          : this.formatMessage(label)}
      </ComponentProp>
    );
  }
}
