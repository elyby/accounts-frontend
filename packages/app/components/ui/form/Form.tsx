import React, { ReactNode } from 'react';
import clsx from 'clsx';

import logger from 'app/services/logger';

import FormModel from './FormModel';
import styles from './form.scss';

interface BaseProps {
    id: string;
    isLoading: boolean;
    onInvalid: (errors: Record<string, string>) => void;
    className?: string;
    children?: ReactNode;
}

interface PropsWithoutForm extends BaseProps {
    onSubmit?: (form: FormData) => Promise<void> | void;
}

interface PropsWithForm extends BaseProps {
    form: FormModel;
    onSubmit?: (form: FormModel) => Promise<void> | void;
}

type Props = PropsWithoutForm | PropsWithForm;

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
        (this.props as PropsWithForm).form?.addLoadingListener(this.onLoading);
        this.mounted = true;
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        const patch: Partial<State> = {};

        if (typeof props.isLoading !== 'undefined' && props.isLoading !== state.isLoading) {
            patch.isLoading = props.isLoading;
        }

        if (props.id !== state.id) {
            patch.id = props.id;
            patch.isTouched = true;
        }

        return patch;
    }

    componentDidUpdate(prevProps: Props) {
        const nextForm = (this.props as PropsWithForm).form;
        const prevForm = (prevProps as PropsWithForm).form;

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
        (this.props as PropsWithForm).form?.removeLoadingListener(this.onLoading);
        this.mounted = false;
    }

    render() {
        const { isLoading } = this.state;

        return (
            <form
                className={clsx(styles.form, this.props.className, {
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
            this.clearErrors();
            let result: Promise<void> | void;

            if ((this.props as PropsWithForm).form) {
                result = (this.props as PropsWithForm).onSubmit!((this.props as PropsWithForm).form);
            } else {
                result = (this.props as PropsWithoutForm).onSubmit!(new FormData(form));
            }

            if (result && result.then) {
                this.setState({ isLoading: true });

                result
                    .catch((errors: Record<string, string>) => {
                        this.setErrors(errors);
                    })
                    .finally(() => this.mounted && this.setState({ isLoading: false }));
            }
        } else {
            const invalidEls: NodeListOf<InputElement> = form.querySelectorAll(':invalid');
            const errors: Record<string, string> = {};
            invalidEls[0].focus(); // focus on first error

            Array.from(invalidEls).reduce((acc, el) => {
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
        (this.props as PropsWithForm).form?.setErrors(errors);
        this.props.onInvalid(errors);
    }

    clearErrors = () => (this.props as PropsWithForm).form?.clearErrors();

    onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        this.submit();
    };

    onLoading = (isLoading: boolean) => this.setState({ isLoading });
}
