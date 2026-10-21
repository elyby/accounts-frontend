import React, { forwardRef } from 'react';

import Markable, { Props as MarkableProps } from './Markable';

type Props = Omit<MarkableProps, 'type'>;

const Checkbox = forwardRef<HTMLInputElement, Props>((props, ref) => {
    return (
        <Markable ref={ref} type="checkbox" {...props} />
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
