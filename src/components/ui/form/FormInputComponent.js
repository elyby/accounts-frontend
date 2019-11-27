// @flow
import type { MessageDescriptor } from 'react-intl';
import React from 'react';

import FormComponent from './FormComponent';
import FormError from './FormError';

type Error = string | MessageDescriptor;

export default class FormInputComponent<P, S = void> extends FormComponent<
  P & {
    error?: Error,
  },
  S & {
    error?: Error,
  },
> {
  componentWillReceiveProps() {
    if (this.state && this.state.error) {
      Reflect.deleteProperty(this.state, 'error');

      this.setState(this.state);
    }
  }

  renderError() {
    const error = (this.state && this.state.error) || this.props.error;

    return <FormError error={error} />;
  }

  setError(error: Error) {
    this.setState({ error });
  }
}
