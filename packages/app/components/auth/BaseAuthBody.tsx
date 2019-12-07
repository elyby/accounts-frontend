/**
 * Helps with form fields binding, form serialization and errors rendering
 */
import PropTypes from 'prop-types';
import React from 'react';
import AuthError from 'app/components/auth/authError/AuthError';
import { userShape } from 'app/components/user/User';
import { FormModel } from 'app/components/ui/form';
import { RouteComponentProps } from 'react-router-dom';

export default class BaseAuthBody extends React.Component<
  // TODO: this may be converted to generic type RouteComponentProps<T>
  RouteComponentProps<{ [key: string]: any }>
> {
  static contextTypes = {
    clearErrors: PropTypes.func.isRequired,
    resolve: PropTypes.func.isRequired,
    requestRedraw: PropTypes.func.isRequired,
    auth: PropTypes.shape({
      error: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          type: PropTypes.string,
          payload: PropTypes.object,
        }),
      ]),
      scopes: PropTypes.array,
    }).isRequired,
    user: userShape,
  };

  autoFocusField: string | null = '';

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextContext.auth.error !== this.context.auth.error) {
      this.form.setErrors(nextContext.auth.error || {});
    }
  }

  renderErrors() {
    const error = this.form.getFirstError();

    return error && <AuthError error={error} onClose={this.onClearErrors} />;
  }

  onFormSubmit() {
    this.context.resolve(this.serialize());
  }

  onClearErrors = this.context.clearErrors;

  form = new FormModel({
    renderErrors: false,
  });

  bindField = this.form.bindField.bind(this.form);

  serialize() {
    return this.form.serialize();
  }

  autoFocus() {
    const fieldId = this.autoFocusField;

    fieldId && this.form.focus(fieldId);
  }
}
