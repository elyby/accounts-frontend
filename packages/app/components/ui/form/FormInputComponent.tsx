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
    componentDidUpdate() {
        if (this.state && this.state.error) {
            this.setState({
                error: undefined,
            });
        }
    }

    renderError() {
        const error = (this.state && this.state.error) || this.props.error;

        return <FormError error={error} />;
    }

    setError(error: Error) {
        // @ts-ignore
        this.setState({ error });
    }
}
