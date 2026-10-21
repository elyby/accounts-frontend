import React, { forwardRef } from 'react';

import Markable, { Props as MarkableProps } from './Markable';

type Props = Omit<MarkableProps, 'type'>;

const Radio = forwardRef<HTMLInputElement, Props>((props, ref) => {
    return (
        <Markable ref={ref} type="radio" {...props} />
    );
});

Radio.displayName = 'Radio';

export default Radio;
