import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router';
import classNames from 'classnames';
import Helmet from 'react-helmet';
import { Motion, spring } from 'react-motion';

import { Input, Button, Form, FormModel } from 'components/ui/form';
import styles from 'components/profile/profileForm.scss';
import helpLinks from 'components/auth/helpLinks.scss';
import MeasureHeight from 'components/MeasureHeight';

import changeEmail from './changeEmail.scss';
import messages from './ChangeEmail.messages';

const STEPS_TOTAL = 3;

// TODO: disable code field, if the code was passed through url

export default class ChangeEmail extends Component {
    static displayName = 'ChangeEmail';

    static propTypes = {
        email: PropTypes.string.isRequired,
        form: PropTypes.instanceOf(FormModel),
        onChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    };

    static get defaultProps() {
        return {
            form: new FormModel()
        };
    }

    state = {
        activeStep: 0
    };


    render() {
        const {form} = this.props;
        const {activeStep} = this.state;

        return (
            <Form onSubmit={this.onFormSubmit}
                form={form}
            >
                <div className={styles.contentWithBackButton}>
                    <Link className={styles.backButton} to="/" />

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

                    <div className={changeEmail.steps}>
                        {(new Array(STEPS_TOTAL)).fill(0).map((_, step) => (
                            <div className={classNames(changeEmail.step, {
                                [changeEmail.activeStep]: step <= activeStep
                            })} key={step} />
                        ))}
                    </div>

                    <div className={styles.form}>
                        {this.renderStepForms()}

                        <Button
                            color="violet"
                            block
                            label={this.isLastStep() ? messages.changeEmailButton : messages.sendEmailButton}
                            onClick={this.onSwitchStep}
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
        const {form, email} = this.props;
        const {activeStep} = this.state;

        const activeStepHeight = this.state[`step${activeStep}Height`] || 0;

        // a hack to disable height animation on first render
        const isHeightMeasured = this.isHeightMeasured;
        this.isHeightMeasured = activeStepHeight > 0;

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
                            <MeasureHeight className={changeEmail.stepForm} onMeasure={this.onStepMeasure(0)}>
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
                                    </div>

                                    <div className={styles.formRow}>
                                        <p className={styles.description}>
                                            <Message {...messages.pressButtonToStart} />
                                        </p>
                                    </div>
                                </div>
                            </MeasureHeight>

                            <MeasureHeight className={changeEmail.stepForm} onMeasure={this.onStepMeasure(1)}>
                                <div className={styles.formBody}>
                                    <div className={styles.formRow}>
                                        <p className={styles.description}>
                                            <Message {...messages.enterInitializationCode} values={{
                                                email: (<b>{email}</b>)
                                            }} />
                                        </p>
                                    </div>

                                    <div className={styles.formRow}>
                                        <Input {...form.bindField('initializationCode')}
                                            required
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
                                        <Input {...form.bindField('newEmail')}
                                            required
                                            skin="light"
                                            color="violet"
                                            placeholder={messages.newEmailPlaceholder}
                                        />
                                    </div>
                                </div>
                            </MeasureHeight>

                            <MeasureHeight className={changeEmail.stepForm} onMeasure={this.onStepMeasure(2)}>
                                <div className={styles.formBody}>
                                    <div className={styles.formRow}>
                                        <p className={styles.description}>
                                            <Message {...messages.enterFinalizationCode} values={{
                                                email: (<b>{form.value('newEmail')}</b>)
                                            }} />
                                        </p>
                                    </div>

                                    <div className={styles.formRow}>
                                        <Input {...form.bindField('finalizationCode')}
                                            required
                                            skin="light"
                                            color="violet"
                                            placeholder={messages.codePlaceholder}
                                        />
                                    </div>
                                </div>
                            </MeasureHeight>
                        </div>
                    </div>
                )}
            </Motion>
        );
    }

    onStepMeasure(step) {
        return (height) => this.setState({
            [`step${step}Height`]: height
        });
    }

    onSwitchStep = (event) => {
        event.preventDefault();

        const {activeStep} = this.state;
        const nextStep = activeStep + 1;

        if (nextStep < STEPS_TOTAL) {
            this.setState({
                activeStep: nextStep
            });
        }
    };

    isLastStep() {
        return this.state.activeStep + 1 === STEPS_TOTAL;
    }

    onUsernameChange = (event) => {
        this.props.onChange(event.target.value);
    };

    onFormSubmit = () => {
        this.props.onSubmit(this.props.form);
    };
}
