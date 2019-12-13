import React from 'react';
import AuthError from 'app/components/auth/authError/AuthError';
import { FormModel } from 'app/components/ui/form';
import { RouteComponentProps } from 'react-router-dom';

import Context, { AuthContext } from './Context';

/**
 * Helps with form fields binding, form serialization and errors rendering
 */

class BaseAuthBody extends React.Component<
  // TODO: this may be converted to generic type RouteComponentProps<T>
  RouteComponentProps<{ [key: string]: any }>
> {
  static contextType = Context;
  /* TODO: use declare */ context: React.ContextType<typeof Context>;
  prevErrors: AuthContext['auth']['error'];

  autoFocusField: string | null = '';

  componentDidMount() {
    this.prevErrors = this.context.auth.error;
  }

  componentDidUpdate() {
    if (this.context.auth.error !== this.prevErrors) {
      this.form.setErrors(this.context.auth.error || {});
      this.context.requestRedraw();
    }

    this.prevErrors = this.context.auth.error;
  }

  renderErrors() {
    const error = this.form.getFirstError();

    return error && <AuthError error={error} onClose={this.onClearErrors} />;
  }

  onFormSubmit() {
    this.context.resolve(this.serialize());
  }

  onClearErrors = () => this.context.clearErrors();

  form = new FormModel({
    renderErrors: false,
  });

  bindField(name: string) {
    return this.form.bindField(name);
  }

  serialize() {
    return this.form.serialize();
  }

  autoFocus() {
    const fieldId = this.autoFocusField;

    if (fieldId && this.form.hasField(fieldId)) {
      this.form.focus(fieldId);
    }
  }
}

export default BaseAuthBody;
