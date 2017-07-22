// @flow
import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import { Button, Form, FormModel } from 'components/ui/form';
import { BackButton } from 'components/profile/ProfileForm';
import styles from 'components/profile/profileForm.scss';
import helpLinks from 'components/auth/helpLinks.scss';
import Stepper from 'components/ui/stepper';
import { ScrollMotion } from 'components/ui/motion';

import Instructions from './instructions';
import KeyForm from './keyForm';
import Confirmation from './confirmation';
import mfaStyles from './mfa.scss';
import messages from './MultiFactorAuth.intl.json';

const STEPS_TOTAL = 3;

type Props = {
    onChangeStep: Function,
    lang: string,
    email: string,
    stepForm: FormModel,
    onSubmit: Function,
    step: 0|1|2,
    code: string
};

export default class MultiFactorAuth extends Component {
    props: Props;

    static defaultProps = {
        stepForm: new FormModel(),
        onChangeStep() {},
        step: 0
    };

    state: {
        activeStep: number,
        code: string,
        newEmail: ?string
    } = {
        activeStep: this.props.step,
        code: this.props.code || '',
        newEmail: null
    };

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            activeStep: typeof nextProps.step === 'number' ? nextProps.step : this.state.activeStep,
            code: nextProps.code || ''
        });
    }

    render() {
        const {activeStep} = this.state;
        const form = this.props.stepForm;

        const stepsData = [
            {
                buttonLabel: messages.theAppIsInstalled
            },
            {
                buttonLabel: messages.ready
            },
            {
                buttonLabel: messages.enableTwoFactorAuth
            }
        ];

        const buttonLabel = stepsData[activeStep].buttonLabel;

        return (
            <Form form={form}
                onSubmit={this.onFormSubmit}
                onInvalid={() => this.forceUpdate()}
            >
                <div className={styles.contentWithBackButton}>
                    <BackButton />

                    <div className={styles.form}>
                        <div className={styles.formBody}>
                            <Message {...messages.mfaTitle}>
                                {(pageTitle) => (
                                    <h3 className={styles.violetTitle}>
                                        <Helmet title={pageTitle} />
                                        {pageTitle}
                                    </h3>
                                )}
                            </Message>

                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message {...messages.mfaDescription} />
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={mfaStyles.stepper}>
                        <Stepper totalSteps={STEPS_TOTAL} activeStep={activeStep} />
                    </div>

                    <div className={styles.form}>
                        {this.renderStepForms()}

                        <Button
                            color="violet"
                            type="submit"
                            block
                            label={buttonLabel}
                        />
                    </div>

                    {this.isLastStep() || 1 ? null : (
                        <div className={helpLinks.helpLinks}>
                            <a href="#" onClick={this.onSwitchStep}>
                                <Message {...messages.alreadyReceivedCode} />
                            </a>
                        </div>
                    )}
                </div>
            </Form>
        );
    }

    renderStepForms() {
        const {activeStep} = this.state;

        const steps = [
            () => <Instructions key="step1" />,
            () => <KeyForm key="step2" />,
            () => (
                <Confirmation key="step3"
                    form={this.props.stepForm}
                    isActiveStep={activeStep === 2}
                    onCodeInput={this.onCodeInput}
                />
            )
        ];

        return (
            <ScrollMotion activeStep={activeStep}>
                {steps.map((renderStep) => renderStep())}
            </ScrollMotion>
        );
    }

    nextStep() {
        const {activeStep} = this.state;
        const nextStep = activeStep + 1;
        const newEmail = null;

        if (nextStep < STEPS_TOTAL) {
            this.setState({
                activeStep: nextStep,
                newEmail
            });

            this.props.onChangeStep(nextStep);
        }
    }

    isLastStep() {
        return this.state.activeStep + 1 === STEPS_TOTAL;
    }

    onSwitchStep = (event: Event) => {
        event.preventDefault();

        this.nextStep();
    };

    onCodeInput = (event: {target: HTMLInputElement}) => {
        const {value} = event.target;

        this.setState({
            code: this.props.code || value
        });
    };

    onFormSubmit = () => {
        this.nextStep();
        // const {activeStep} = this.state;
        // const form = this.props.stepForms[activeStep];
        // const promise = this.props.onSubmit(activeStep, form);
        //
        // if (!promise || !promise.then) {
        //     throw new Error('Expecting promise from onSubmit');
        // }
        //
        // promise.then(() => this.nextStep(), (resp) => {
        //     if (resp.errors) {
        //         form.setErrors(resp.errors);
        //         this.forceUpdate();
        //     } else {
        //         return Promise.reject(resp);
        //     }
        // });
    };
}
