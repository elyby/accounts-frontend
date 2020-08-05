import React from 'react';
import { MessageDescriptor } from 'react-intl';

import FormComponent from './FormComponent';
import FormError from './FormError';
import { ValidationError } from './FormModel';

type Error = ValidationError | MessageDescriptor;

export default class FormInputComponent<P, S = {}> extends FormComponent<
    P & {
        error?: Error;
    },
    S & {
        error?: Error;
    }
> {
    constructor(props: P & { error?: Error }) {
        super(props);
        this.state = { ...this.state, error: props.error };
    }

    renderError() {
        return <FormError error={this.state?.error} />;
    }

    setError(error: Error) {
        // @ts-ignore
        this.setState({ error });
    }
}
