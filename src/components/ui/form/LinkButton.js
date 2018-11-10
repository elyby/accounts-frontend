// @flow
import type { ElementProps } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';

export default function LinkButton(
    props: ElementProps<typeof Button> & ElementProps<typeof Link>
) {
    const { to, ...restProps } = props;

    return <Button component={Link} to={to} {...restProps} />;
}
