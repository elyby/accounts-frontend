import React from 'react';
import clsx from 'clsx';
import logger from 'app/services/logger';

import FormModel from './FormModel';
import styles from './form.scss';

interface Props {
  id: string;
  isLoading: boolean;
  form?: FormModel;
  onSubmit: (form: FormModel | FormData) => void | Promise<void>;
  onInvalid: (errors: { [errorKey: string]: string }) => void;
  children: React.ReactNode;
}
interface State {
  id: string; // just to track value for derived updates
  isTouched: boolean;
  isLoading: boolean;
}
type InputElement = HTMLInputElement | HTMLTextAreaElement;

export default class Form extends React.Component<Props, State> {
  static defaultProps = {
    id: 'default',
    isLoading: false,
    onSubmit() {},
    onInvalid() {},
  };

  state: State = {
    id: this.props.id,
    isTouched: false,
    isLoading: this.props.isLoading || false,
  };

  formEl: HTMLFormElement | null;

  mounted = false;

  componentDidMount() {
    if (this.props.form) {
      this.props.form.addLoadingListener(this.onLoading);
    }

    this.mounted = true;
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const patch: Partial<State> = {};

    if (
      typeof props.isLoading !== 'undefined' &&
      props.isLoading !== state.isLoading
    ) {
      patch.isLoading = props.isLoading;
    }

    if (props.id !== state.id) {
      patch.id = props.id;
      patch.isTouched = true;
    }

    return patch;
  }

  componentDidUpdate(prevProps: Props) {
    const nextForm = this.props.form;
    const prevForm = prevProps.form;

    if (nextForm !== prevForm) {
      if (prevForm) {
        prevForm.removeLoadingListener(this.onLoading);
      }

      if (nextForm) {
        nextForm.addLoadingListener(this.onLoading);
      }
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
        className={clsx(styles.form, {
          [styles.isFormLoading]: isLoading,
          [styles.formTouched]: this.state.isTouched,
        })}
        onSubmit={this.onFormSubmit}
        ref={(el: HTMLFormElement | null) => (this.formEl = el)}
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
      const invalidEls: NodeListOf<InputElement> = form.querySelectorAll(
        ':invalid',
      );
      const errors = {};
      invalidEls[0].focus(); // focus on first error

      Array.from(invalidEls).reduce((acc, el: InputElement) => {
        if (!el.name) {
          logger.warn('Found an element without name', { el });

          return acc;
        }

        let errorMessage = el.validationMessage;

        if (el.validity.valueMissing) {
          errorMessage = `error.${el.name}_required`;
        } else if (el.validity.typeMismatch) {
          errorMessage = `error.${el.name}_invalid`;
        }

        acc[el.name] = errorMessage;

        return acc;
      }, errors);

      this.setErrors(errors);
    }
  }

  setErrors(errors: { [key: string]: string }) {
    this.props.form && this.props.form.setErrors(errors);
    this.props.onInvalid(errors);
  }

  onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.submit();
  };

  onLoading = (isLoading: boolean) => this.setState({ isLoading });
}