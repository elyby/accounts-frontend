import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import { Motion, spring } from 'react-motion';

import { Input, Button, Form, FormModel, FormError } from 'components/ui/form';
import { BackButton } from 'components/profile/ProfileForm';
import styles from 'components/profile/profileForm.scss';
import helpLinks from 'components/auth/helpLinks.scss';
import MeasureHeight from 'components/MeasureHeight';
import Stepper from 'components/ui/stepper';

import changeEmail from './changeEmail.scss';
import messages from './ChangeEmail.intl.json';

const STEPS_TOTAL = 3;

export default class ChangeEmail extends Component {
    static displayName = 'ChangeEmail';

    static propTypes = {
        onChangeStep: PropTypes.func,
        lang: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        stepForms: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {
            if (propValue.length !== 3) {
                return new Error(`\`${propFullName}\` must be an array of 3 FormModel instances. Validation failed.`);
            }

            if (!(propValue[key] instanceof FormModel)) {
                return new Error(
                    `Invalid prop \`${propFullName}\` supplied to \
                    \`${componentName}\`. Validation failed.`
                );
            }
        }),
        onSubmit: PropTypes.func.isRequired,
        step: PropTypes.oneOf([0, 1, 2]),
        code: PropTypes.string
    };

    static get defaultProps() {
        return {
            stepForms: [
                new FormModel(),
                new FormModel(),
                new FormModel()
            ],
            onChangeStep() {},
            step: 0
        };
    }

    state = {
        activeStep: this.props.step,
        code: this.props.code || ''
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            activeStep: typeof nextProps.step === 'number' ? nextProps.step : this.state.activeStep,
            code: nextProps.code || ''
        });
    }

    render() {
        const {activeStep} = this.state;
        const form = this.props.stepForms[activeStep];

        return (
            <Form form={form}
                onSubmit={this.onFormSubmit}
                onInvalid={() => this.forceUpdate()}
            >
                <div className={styles.contentWithBackButton}>
                    <BackButton />

                    <div className={styles.form}>
                        <div className={styles.formBody}>
                            <Message {...messages.changeEmailTitle}>
                                {(pageTitle) => (
                                    <h3 className={styles.violetTitle}>
                                        <Helmet title={pageTitle} />
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

                    <div className={changeEmail.stepper}>
                        <Stepper totalSteps={STEPS_TOTAL} activeStep={activeStep} />
                    </div>

                    <div className={styles.form}>
                        {this.renderStepForms()}

                        <Button
                            color="violet"
                            type="submit"
                            block
                            label={this.isLastStep() ? messages.changeEmailButton : messages.sendEmailButton}
                            onClick={this.onSubmit}
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
        const {email} = this.props;
        const {activeStep, code} = this.state;
        const isCodeSpecified = !!this.props.code;

        const activeStepHeight = this.state[`step${activeStep}Height`] || 0;

        // a hack to disable height animation on first render
        const isHeightMeasured = this.isHeightMeasured;
        this.isHeightMeasured = isHeightMeasured || activeStepHeight > 0;

        return (
            <Motion
                style={{
                    transform: spring(activeStep * 100, {stiffness: 500, damping: 50, precision: 0.5}),
                    height: isHeightMeasured ? spring(activeStepHeight, {stiffness: 500, damping: 20, precision: 0.5}) : activeStepHeight
                }}
            >
                {(interpolatingStyle) => (
                    <div style={{
                        overflow: 'hidden',
                        height: `${interpolatingStyle.height}px`
                    }}>
                        <div className={changeEmail.stepForms} style={{
                            WebkitTransform: `translateX(-${interpolatingStyle.transform}%)`,
                            transform: `translateX(-${interpolatingStyle.transform}%)`
                        }}>
                            {(new Array(STEPS_TOTAL)).fill(0).map((_, step) => {
                                const form = this.props.stepForms[step];

                                return (
                                    <MeasureHeight
                                        className={changeEmail.stepForm}
                                        onMeasure={this.onStepMeasure(step)}
                                        state={`${step}.${form.hasErrors()}.${this.props.lang}`}
                                        key={step}
                                    >
                                        {this[`renderStep${step}`]({
                                            email,
                                            code,
                                            isCodeSpecified,
                                            form,
                                            isActiveStep: step === activeStep
                                        })}
                                    </MeasureHeight>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Motion>
        );
    }

    renderStep0({email, form}) {
        return (
            <div className={styles.formBody}>
                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.currentAccountEmail} />
                    </p>
                </div>

                <div className={styles.formRow}>
                    <h2 className={changeEmail.currentAccountEmail}>
                        {email}
                    </h2>

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

    renderStep1({email, form, code, isCodeSpecified, isActiveStep}) {
        return (
            <div className={styles.formBody}>
                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.enterInitializationCode} values={{
                            email: (<b>{email}</b>)
                        }} />
                    </p>
                </div>

                <div className={styles.formRow}>
                    <Input {...form.bindField('key')}
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
                    <Input {...form.bindField('email')}
                        required={isActiveStep}
                        skin="light"
                        color="violet"
                        placeholder={messages.newEmailPlaceholder}
                    />
                </div>
            </div>
        );
    }

    renderStep2({form, code, isCodeSpecified, isActiveStep}) {
        const {newEmail} = this.state;

        return (
            <div className={styles.formBody}>
                <div className={styles.formRow}>
                    <p className={styles.description}>
                        {newEmail ? (
                            <span>
                                <Message {...messages.finalizationCodeWasSentToEmail} values={{
                                    email: (<b>{newEmail}</b>)
                                }} />
                                {' '}
                            </span>
                        ) : null}
                        <Message {...messages.enterFinalizationCode} />
                    </p>
                </div>

                <div className={styles.formRow}>
                    <Input {...form.bindField('key')}
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

    onStepMeasure(step) {
        return (height) => this.setState({
            [`step${step}Height`]: height
        });
    }

    nextStep() {
        const {activeStep} = this.state;
        const nextStep = activeStep + 1;
        let newEmail = null;

        if (activeStep === 1) {
            newEmail = this.props.stepForms[1].value('email');
        }

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

    onSwitchStep = (event) => {
        event.preventDefault();

        this.nextStep();
    };

    onCodeInput = (event) => {
        const {value} = event.target;

        this.setState({
            code: this.props.code || value
        });
    };

    onFormSubmit = () => {
        const {activeStep} = this.state;
        const form = this.props.stepForms[activeStep];
        const promise = this.props.onSubmit(activeStep, form);

        if (!promise || !promise.then) {
            throw new Error('Expecting promise from onSubmit');
        }

        promise.then(() => this.nextStep(), (resp) => {
            if (resp.errors) {
                form.setErrors(resp.errors);
                this.forceUpdate();
            } else {
                return Promise.reject(resp);
            }
        });
    };
}
