import React from 'react';
import { Button, FormModel } from 'app/components/ui/form';
import styles from 'app/components/profile/profileForm.scss';
import Stepper from 'app/components/ui/stepper';
import { SlideMotion } from 'app/components/ui/motion';
import { ScrollIntoView } from 'app/components/ui/scroll';
import logger from 'app/services/logger';
import { getSecret, enable as enableMFA } from 'app/services/api/mfa';
import { Form } from 'app/components/ui/form';

import Context from '../Context';
import Instructions from './instructions';
import KeyForm from './keyForm';
import Confirmation from './confirmation';
import messages from './MultiFactorAuth.intl.json';

const STEPS_TOTAL = 3;

export type MfaStep = 0 | 1 | 2;
type Props = {
    onChangeStep: (nextStep: number) => void;
    confirmationForm: FormModel;
    onSubmit: (form: FormModel, sendData: () => Promise<void>) => Promise<void>;
    onComplete: () => void;
    step: MfaStep;
};

interface State {
    isLoading: boolean;
    activeStep: MfaStep;
    secret: string;
    qrCodeSrc: string;
}

export default class MfaEnable extends React.PureComponent<Props, State> {
    static contextType = Context;
    /* TODO: use declare */ context: React.ContextType<typeof Context>;

    static defaultProps = {
        confirmationForm: new FormModel(),
        step: 0,
    };

    state = {
        isLoading: false,
        activeStep: this.props.step,
        qrCodeSrc: '',
        secret: '',
    };

    confirmationFormEl: Form | null;

    componentDidMount() {
        this.syncState(this.props);
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.step !== state.activeStep) {
            return {
                activeStep: props.step,
            };
        }

        return null;
    }

    componentDidUpdate() {
        this.syncState(this.props);
    }

    render() {
        const { activeStep, isLoading } = this.state;

        const stepsData = [
            {
                buttonLabel: messages.theAppIsInstalled,
                buttonAction: () => this.nextStep(),
            },
            {
                buttonLabel: messages.ready,
                buttonAction: () => this.nextStep(),
            },
            {
                buttonLabel: messages.enable,
                buttonAction: () => this.confirmationFormEl && this.confirmationFormEl.submit(),
            },
        ];

        const { buttonLabel, buttonAction } = stepsData[activeStep];

        return (
            <div>
                <div className={styles.stepper}>
                    <Stepper totalSteps={STEPS_TOTAL} activeStep={activeStep} />
                </div>

                <div className={styles.form}>
                    {activeStep > 0 ? <ScrollIntoView /> : null}

                    {this.renderStepForms()}

                    <Button color="green" onClick={buttonAction} loading={isLoading} block label={buttonLabel} />
                </div>
            </div>
        );
    }

    renderStepForms() {
        const { activeStep, secret, qrCodeSrc } = this.state;

        return (
            <SlideMotion activeStep={activeStep}>
                <Instructions key="step1" />
                <KeyForm key="step2" secret={secret} qrCodeSrc={qrCodeSrc} />
                <Confirmation
                    key="step3"
                    form={this.props.confirmationForm}
                    formRef={(el) => (this.confirmationFormEl = el)}
                    onSubmit={this.onTotpSubmit}
                    onInvalid={() => this.forceUpdate()}
                />
            </SlideMotion>
        );
    }

    syncState(props: Props) {
        const { isLoading, qrCodeSrc } = this.state;

        if (props.step === 1 && !isLoading && !qrCodeSrc) {
            this.setState({ isLoading: true });

            getSecret(this.context.userId).then((resp) => {
                this.setState({
                    isLoading: false,
                    secret: resp.secret,
                    qrCodeSrc: resp.qr,
                });
            });
        }
    }

    nextStep() {
        const nextStep = this.state.activeStep + 1;

        if (nextStep < STEPS_TOTAL) {
            this.props.onChangeStep(nextStep);
        }
    }

    onTotpSubmit = (form: FormModel): Promise<void> => {
        this.setState({ isLoading: true });

        return this.props
            .onSubmit(form, () => {
                const data = form.serialize();

                return enableMFA(this.context.userId, data.totp, data.password);
            })
            .then(() => this.props.onComplete())
            .catch((resp) => {
                const { errors } = resp || {};

                if (errors) {
                    return Promise.reject(errors);
                }

                logger.error('MFA: Unexpected form submit result', {
                    resp,
                });
            })
            .finally(() => this.setState({ isLoading: false }));
    };
}
