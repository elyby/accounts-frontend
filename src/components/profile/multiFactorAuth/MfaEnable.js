// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, FormModel } from 'components/ui/form';
import styles from 'components/profile/profileForm.scss';
import Stepper from 'components/ui/stepper';
import { SlideMotion } from 'components/ui/motion';
import { ScrollIntoView } from 'components/ui/scroll';
import logger from 'services/logger';
import { getSecret, enable as enableMFA } from 'services/api/mfa';

import Instructions from './instructions';
import KeyForm from './keyForm';
import Confirmation from './confirmation';
import messages from './MultiFactorAuth.intl.json';

import type { Form } from 'components/ui/form';

const STEPS_TOTAL = 3;

export type MfaStep = 0 | 1 | 2;
type Props = {
    onChangeStep: Function,
    confirmationForm: FormModel,
    onSubmit: (form: FormModel, sendData: () => Promise<*>) => Promise<*>,
    onComplete: Function,
    step: MfaStep,
};

interface State {
    isLoading: bool;
    activeStep: MfaStep;
    secret: string;
    qrCodeSrc: string;
}

export default class MfaEnable extends Component<Props, State> {
    static defaultProps = {
        confirmationForm: new FormModel(),
        step: 0,
    };

    static contextTypes = {
        userId: PropTypes.number.isRequired,
    };

    state = {
        isLoading: false,
        activeStep: this.props.step,
        qrCodeSrc: '',
        secret: '',
    };

    confirmationFormEl: ?Form;

    componentWillMount() {
        this.syncState(this.props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this.syncState(nextProps);
    }

    render() {
        const {activeStep, isLoading} = this.state;

        const stepsData = [
            {
                buttonLabel: messages.theAppIsInstalled,
                buttonAction: () => this.nextStep()
            },
            {
                buttonLabel: messages.ready,
                buttonAction: () => this.nextStep()
            },
            {
                buttonLabel: messages.enable,
                buttonAction: () => this.confirmationFormEl && this.confirmationFormEl.submit()
            }
        ];

        const {buttonLabel, buttonAction} = stepsData[activeStep];

        return (
            <div>
                <div className={styles.stepper}>
                    <Stepper totalSteps={STEPS_TOTAL} activeStep={activeStep} />
                </div>

                <div className={styles.form}>
                    {activeStep > 0 ? <ScrollIntoView /> : null}

                    {this.renderStepForms()}

                    <Button
                        color="green"
                        onClick={buttonAction}
                        loading={isLoading}
                        block
                        label={buttonLabel}
                    />
                </div>
            </div>
        );
    }

    renderStepForms() {
        const {activeStep, secret, qrCodeSrc} = this.state;

        return (
            <SlideMotion activeStep={activeStep}>
                {[
                    <Instructions key="step1" />,
                    <KeyForm key="step2"
                        secret={secret}
                        qrCodeSrc={qrCodeSrc}
                    />,
                    <Confirmation key="step3"
                        form={this.props.confirmationForm}
                        formRef={(el: Form) => this.confirmationFormEl = el}
                        onSubmit={this.onTotpSubmit}
                        onInvalid={() => this.forceUpdate()}
                    />
                ]}
            </SlideMotion>
        );
    }

    syncState(props: Props) {
        if (props.step === 1) {
            this.setState({isLoading: true});

            getSecret(this.context.userId).then((resp) => {
                this.setState({
                    isLoading: false,
                    secret: resp.secret,
                    qrCodeSrc: resp.qr
                });
            });
        }

        this.setState({
            activeStep: typeof props.step === 'number' ? props.step : this.state.activeStep
        });
    }

    nextStep() {
        const nextStep = this.state.activeStep + 1;

        if (nextStep < STEPS_TOTAL) {
            this.props.onChangeStep(nextStep);
        }
    }

    onTotpSubmit = (form: FormModel): Promise<*> => {
        this.setState({isLoading: true});

        return this.props.onSubmit(
            form,
            () => {
                const data = form.serialize();

                return enableMFA(this.context.userId, data.totp, data.password);
            }
        )
            .then(() => this.props.onComplete())
            .catch((resp) => {
                const {errors} = resp || {};

                if (errors) {
                    return Promise.reject(errors);
                }

                logger.error('MFA: Unexpected form submit result', {
                    resp
                });
            })
            .finally(() => this.setState({isLoading: false}));
    };
}
