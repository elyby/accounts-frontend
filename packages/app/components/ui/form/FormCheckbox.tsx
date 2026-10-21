import React, { ComponentProps, forwardRef, useImperativeHandle, useRef, useState } from 'react';

import Checkbox from './Checkbox';
import FormError from './FormError';
import type { FormFieldHandle } from './FormModel';

type Error = ComponentProps<typeof FormError>['error'];

interface Props extends ComponentProps<typeof Checkbox> {
    error?: Error;
}

/**
 * The Checkbox, bound to the FormModel: provides the field's value and renders its errors
 */
const FormCheckbox = forwardRef<FormFieldHandle, Props>(({ error: propsError, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<Error>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => (inputRef.current?.checked ? 1 : 0),
        setError,
        focus: () => inputRef.current?.focus(),
        onFormInvalid() {},
    }), []);

    return (
        <>
            <Checkbox ref={inputRef} {...props} />
            <FormError error={error || propsError} />
        </>
    );
});

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
