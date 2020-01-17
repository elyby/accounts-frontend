import React, { ReactNode } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { SlideMotion } from 'app/components/ui/motion';
import { ScrollIntoView } from 'app/components/ui/scroll';
import {
  Input,
  Button,
  Form,
  FormModel,
  FormError,
} from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';
import styles from 'app/components/profile/profileForm.scss';
import helpLinks from 'app/components/auth/helpLinks.scss';
import Stepper from 'app/components/ui/stepper';

import changeEmail from './changeEmail.scss';
import messages from './ChangeEmail.intl.json';

const STEPS_TOTAL = 3;

export type ChangeEmailStep = 0 | 1 | 2;

interface Props {
  onChangeStep: (step: ChangeEmailStep) => void;
  lang: string;
  email: string;
  stepForms: Array<FormModel>;
  onSubmit: (step: ChangeEmailStep, form: FormModel) => Promise<void>;
  step: ChangeEmailStep;
  code?: string;
}

interface State {
  newEmail: string | null;
  activeStep: ChangeEmailStep;
  code: string;
}

interface FormStepParams {
  form: FormModel;
  isActiveStep: boolean;
  isCodeSpecified: boolean;
  email: string;
  code?: string;
}

export default class ChangeEmail extends React.Component<Props, State> {
  static get defaultProps(): Partial<Props> {
    return {
      stepForms: [new FormModel(), new FormModel(), new FormModel()],
      onChangeStep() {},
      step: 0,
    };
  }

  state: State = {
    newEmail: null,
    activeStep: this.props.step,
    code: this.props.code || '',
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    return {
      activeStep:
        typeof props.step === 'number' ? props.step : state.activeStep,
      code: props.code || state.code,
    };
  }

  render() {
    const { activeStep } = this.state;
    const form = this.props.stepForms[activeStep];

    return (
      <Form
        form={form}
        onSubmit={this.onFormSubmit}
        onInvalid={() => this.forceUpdate()}
      >
        <div
          className={styles.contentWithBackButton}
          data-testid="change-email"
        >
          <BackButton />

          <div className={styles.form}>
            <div className={styles.formBody}>
              <Message {...messages.changeEmailTitle}>
                {pageTitle => (
                  <h3 className={styles.violetTitle}>
                    <Helmet title={pageTitle as string} />
                    {pageTitle}
                  </h3>
                )}
              </Message>

              <div className={styles.formRow}>
                <p className={styles.description}>
                  <Message {...messages.changeEmailDescription} />
                </p>
              </div>
            </div>
          </div>

          <div className={styles.stepper}>
            <Stepper
              color="violet"
              totalSteps={STEPS_TOTAL}
              activeStep={activeStep}
            />
          </div>

          <div className={styles.form}>
            {activeStep > 0 ? <ScrollIntoView /> : null}

            {this.renderStepForms()}

            <Button
              color="violet"
              type="submit"
              block
              label={
                this.isLastStep()
                  ? messages.changeEmailButton
                  : messages.sendEmailButton
              }
            />
          </div>

          <div className={helpLinks.helpLinks}>
            {this.isLastStep() ? null : (
              <a href="#" onClick={this.onSwitchStep}>
                <Message {...messages.alreadyReceivedCode} />
              </a>
            )}
          </div>
        </div>
      </Form>
    );
  }

  renderStepForms() {
    const { email } = this.props;
    const { activeStep, code } = this.state;
    const isCodeSpecified = !!this.props.code;

    return (
      <SlideMotion activeStep={activeStep}>
        {new Array(STEPS_TOTAL).fill(0).map((_, step) => {
          const formParams: FormStepParams = {
            form: this.props.stepForms[step],
            isActiveStep: step === activeStep,
            isCodeSpecified,
            email,
            code,
          };

          switch (step) {
            case 0:
              return this.renderStep0(formParams);
            case 1:
              return this.renderStep1(formParams);
            case 2:
              return this.renderStep2(formParams);
          }
        })}
      </SlideMotion>
    );
  }

  renderStep0({ email, form }: FormStepParams): ReactNode {
    return (
      <div key="step0" data-testid="step1" className={styles.formBody}>
        <div className={styles.formRow}>
          <p className={styles.description}>
            <Message {...messages.currentAccountEmail} />
          </p>
        </div>

        <div className={styles.formRow}>
          <h2 className={changeEmail.currentAccountEmail}>{email}</h2>

          <FormError error={form.getError('email')} />
        </div>

        <div className={styles.formRow}>
          <p className={styles.description}>
            <Message {...messages.pressButtonToStart} />
          </p>
        </div>
      </div>
    );
  }

  renderStep1({
    email,
    form,
    code,
    isCodeSpecified,
    isActiveStep,
  }: FormStepParams): ReactNode {
    return (
      <div key="step1" data-testid="step2" className={styles.formBody}>
        <div className={styles.formRow}>
          <p className={styles.description}>
            <Message
              {...messages.enterInitializationCode}
              values={{
                email: <b>{email}</b>,
              }}
            />
          </p>
        </div>

        <div className={styles.formRow}>
          <Input
            {...form.bindField('key')}
            required={isActiveStep}
            disabled={isCodeSpecified}
            value={code}
            onChange={this.onCodeInput}
            autoComplete="off"
            skin="light"
            color="violet"
            placeholder={messages.codePlaceholder}
          />
        </div>

        <div className={styles.formRow}>
          <p className={styles.description}>
            <Message {...messages.enterNewEmail} />
          </p>
        </div>

        <div className={styles.formRow}>
          <Input
            {...form.bindField('email')}
            required={isActiveStep}
            skin="light"
            color="violet"
            placeholder={messages.newEmailPlaceholder}
          />
        </div>
      </div>
    );
  }

  renderStep2({
    form,
    code,
    isCodeSpecified,
    isActiveStep,
  }: FormStepParams): ReactNode {
    const { newEmail } = this.state;

    return (
      <div key="step2" data-testid="step3" className={styles.formBody}>
        <div className={styles.formRow}>
          <p className={styles.description}>
            {newEmail ? (
              <span>
                <Message
                  {...messages.finalizationCodeWasSentToEmail}
                  values={{
                    email: <b>{newEmail}</b>,
                  }}
                />{' '}
              </span>
            ) : null}
            <Message {...messages.enterFinalizationCode} />
          </p>
        </div>

        <div className={styles.formRow}>
          <Input
            {...form.bindField('key')}
            required={isActiveStep}
            disabled={isCodeSpecified}
            value={code}
            onChange={this.onCodeInput}
            autoComplete="off"
            skin="light"
            color="violet"
            placeholder={messages.codePlaceholder}
          />
        </div>
      </div>
    );
  }

  nextStep() {
    const { activeStep } = this.state;
    const nextStep = activeStep + 1;
    let newEmail = null;

    if (activeStep === 1) {
      newEmail = this.props.stepForms[1].value('email');
    }

    if (nextStep < STEPS_TOTAL) {
      this.setState({
        activeStep: nextStep as ChangeEmailStep,
        newEmail,
      });

      this.props.onChangeStep(nextStep as ChangeEmailStep);
    }
  }

  isLastStep() {
    return this.state.activeStep + 1 === STEPS_TOTAL;
  }

  onSwitchStep = (event: React.MouseEvent) => {
    event.preventDefault();

    this.nextStep();
  };

  onCodeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (this.props.code) {
      return;
    }

    this.setState({
      code: value,
    });
  };

  onFormSubmit = () => {
    const { activeStep } = this.state;
    const form = this.props.stepForms[activeStep];
    const promise = this.props.onSubmit(activeStep, form);

    if (!promise || !promise.then) {
      throw new Error('Expecting promise from onSubmit');
    }

    promise.then(
      () => {
        this.nextStep();
        this.setState({
          code: '',
        });
      },
      resp => {
        if (resp.errors) {
          form.setErrors(resp.errors);
          this.forceUpdate();
        } else {
          return Promise.reject(resp);
        }
      },
    );
  };
}
