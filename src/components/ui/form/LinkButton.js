// @flow
import type { ElementConfig } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';

export default function LinkButton(
    props: {
        ...$Exact<ElementConfig<typeof Button>>,
        ...$Exact<ElementConfig<typeof Link>>
    }
) {
    const { to, ...restProps } = props;

    return <Button component={Link} to={to} {...restProps} />;
}
