// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import classNames from 'classnames';
import logger from 'services/logger';

import type FormModel from './FormModel';
import styles from './form.scss';

type Props = {|
  id: string,
  isLoading: boolean,
  form?: FormModel,
  onSubmit: (form: FormModel | FormData) => void | Promise<void>,
  onInvalid: (errors: { [errorKey: string]: string }) => void,
  children: Node,
|};
type State = {
  isTouched: boolean,
  isLoading: boolean,
};
type InputElement = HTMLInputElement | HTMLTextAreaElement;

export default class Form extends Component<Props, State> {
  static defaultProps = {
    id: 'default',
    isLoading: false,
    onSubmit() {},
    onInvalid() {},
  };

  state = {
    isTouched: false,
    isLoading: this.props.isLoading || false,
  };

  formEl: ?HTMLFormElement;

  mounted = false;

  componentDidMount() {
    if (this.props.form) {
      this.props.form.addLoadingListener(this.onLoading);
    }

    this.mounted = true;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.id !== this.props.id) {
      this.setState({
        isTouched: false,
      });
    }

    if (
      typeof nextProps.isLoading !== 'undefined' &&
      nextProps.isLoading !== this.state.isLoading
    ) {
      this.setState({
        isLoading: nextProps.isLoading,
      });
    }

    const nextForm = nextProps.form;

    if (nextForm && this.props.form && nextForm !== this.props.form) {
      this.props.form.removeLoadingListener(this.onLoading);
      nextForm.addLoadingListener(this.onLoading);
    }
  }

  componentWillUnmount() {
    if (this.props.form) {
      this.props.form.removeLoadingListener(this.onLoading);
    }

    this.mounted = false;
  }

  render() {
    const { isLoading } = this.state;

    return (
      <form
        className={classNames(styles.form, {
          [styles.isFormLoading]: isLoading,
          [styles.formTouched]: this.state.isTouched,
        })}
        onSubmit={this.onFormSubmit}
        ref={(el: ?HTMLFormElement) => (this.formEl = el)}
        noValidate
      >
        {this.props.children}
      </form>
    );
  }

  submit() {
    if (!this.state.isTouched) {
      this.setState({
        isTouched: true,
      });
    }

    const form = this.formEl;

    if (!form) {
      return;
    }

    if (form.checkValidity()) {
      const result = this.props.onSubmit(
        this.props.form ? this.props.form : new FormData(form),
      );

      if (result && result.then) {
        this.setState({ isLoading: true });

        result
          .catch((errors: { [key: string]: string }) => {
            this.setErrors(errors);
          })
          .finally(() => this.mounted && this.setState({ isLoading: false }));
      }
    } else {
      const invalidEls: NodeList<InputElement> = (form.querySelectorAll(
        ':invalid',
      ): any);
      const errors = {};
      invalidEls[0].focus(); // focus on first error

      Array.from(invalidEls).reduce((errors, el: InputElement) => {
        if (!el.name) {
          logger.warn('Found an element without name', { el });

          return errors;
        }

        let errorMessage = el.validationMessage;

        if (el.validity.valueMissing) {
          errorMessage = `error.${el.name}_required`;
        } else if (el.validity.typeMismatch) {
          errorMessage = `error.${el.name}_invalid`;
        }

        errors[el.name] = errorMessage;

        return errors;
      }, errors);

      this.setErrors(errors);
    }
  }

  setErrors(errors: { [key: string]: string }) {
    this.props.form && this.props.form.setErrors(errors);
    this.props.onInvalid(errors);
  }

  onFormSubmit = (event: Event) => {
    event.preventDefault();

    this.submit();
  };

  onLoading = (isLoading: boolean) => this.setState({ isLoading });
}
