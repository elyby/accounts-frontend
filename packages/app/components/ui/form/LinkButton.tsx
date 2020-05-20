import React from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';

type ButtonProps = React.ComponentProps<typeof Button>;
type LinkProps = React.ComponentProps<typeof Link>;

export default function LinkButton(props: ButtonProps & LinkProps) {
  const { to, ...restProps } = props;

  return (
    <Button
      component={(linkProps) => <Link {...linkProps} to={to} />}
      {...(restProps as ButtonProps)}
    />
  );
}
