import React from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';

export default function LinkButton(
  props: React.ComponentProps<typeof Button> &
    React.ComponentProps<typeof Link>,
) {
  const { to, ...restProps } = props;

  return (
    <Button
      component={(linkProps) => <Link {...linkProps} to={to} />}
      {...restProps}
    />
  );
}
