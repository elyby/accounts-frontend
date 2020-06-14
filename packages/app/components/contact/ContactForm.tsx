import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { FormattedMessage as Message, defineMessages } from 'react-intl';
import { Input, TextArea, Button, Form, FormModel, Dropdown } from 'app/components/ui/form';
import feedback from 'app/services/api/feedback';
import icons from 'app/components/ui/icons.scss';
import popupStyles from 'app/components/ui/popup/popup.scss';
import { RootState } from 'app/reducers';
import logger from 'app/services/logger';
import { User } from 'app/components/user';

import styles from './contactForm.scss';

const CONTACT_CATEGORIES = {
    // TODO: сюда позже проставить реальные id категорий с backend
    0: <Message key="cannotAccessMyAccount" defaultMessage="Can not access my account" />,
    1: <Message key="foundBugOnSite" defaultMessage="I found a bug on the site" />,
    2: <Message key="improvementsSuggestion" defaultMessage="I have a suggestion for improving the functional" />,
    3: <Message key="integrationQuestion" defaultMessage="Service integration question" />,
    4: <Message key="other" defaultMessage="Other" />,
};

const labels = defineMessages({
    subject: 'Subject',
    email: 'E‑mail',
    message: 'Message',
    whichQuestion: 'What are you interested in?',

    send: 'Send',

    close: 'Close',
});

export class ContactForm extends React.Component<
    {
        onClose: () => void;
        user: User;
    },
    {
        isLoading: boolean;
        isSuccessfullySent: boolean;
        lastEmail: string | null;
    }
> {
    static defaultProps = {
        onClose() {},
    };

    state = {
        isLoading: false,
        isSuccessfullySent: false,
        lastEmail: null,
    };

    form = new FormModel();

    render() {
        const { isSuccessfullySent } = this.state || {};
        const { onClose } = this.props;

        return (
            <div data-testid="feedbackPopup" className={isSuccessfullySent ? styles.successState : styles.contactForm}>
                <div className={popupStyles.popup}>
                    <div className={popupStyles.header}>
                        <h2 className={popupStyles.headerTitle}>
                            <Message key="title" defaultMessage="Feedback form" />
                        </h2>
                        <span
                            className={clsx(icons.close, popupStyles.close)}
                            onClick={onClose}
                            data-testid="feedback-popup-close"
                        />
                    </div>

                    {isSuccessfullySent ? this.renderSuccess() : this.renderForm()}
                </div>
            </div>
        );
    }

    renderForm() {
        const { form } = this;
        const { user } = this.props;
        const { isLoading } = this.state;

        return (
            <Form form={form} onSubmit={this.onSubmit} isLoading={isLoading}>
                <div className={popupStyles.body}>
                    <div className={styles.philosophicalThought}>
                        <Message
                            key="philosophicalThought"
                            defaultMessage="Properly formulated question — half of the answer"
                        />
                    </div>

                    <div className={styles.formDisclaimer}>
                        <Message
                            key="disclaimer"
                            defaultMessage="Please formulate your feedback providing as much useful information, as possible to help us understand your problem and solve it"
                        />
                        <br />
                    </div>

                    <div className={styles.pairInputRow}>
                        <div className={styles.pairInput}>
                            <Input {...form.bindField('subject')} required label={labels.subject} skin="light" />
                        </div>

                        <div className={styles.pairInput}>
                            <Input
                                {...form.bindField('email')}
                                required
                                label={labels.email}
                                type="email"
                                skin="light"
                                defaultValue={user.email}
                            />
                        </div>
                    </div>

                    <div className={styles.formMargin}>
                        <Dropdown
                            {...form.bindField('category')}
                            label={labels.whichQuestion}
                            items={CONTACT_CATEGORIES}
                            block
                        />
                    </div>

                    <TextArea
                        {...form.bindField('message')}
                        required
                        label={labels.message}
                        skin="light"
                        minRows={6}
                        maxRows={6}
                    />
                </div>

                <div className={styles.footer}>
                    <Button label={labels.send} block type="submit" disabled={isLoading} />
                </div>
            </Form>
        );
    }

    renderSuccess() {
        const { lastEmail: email } = this.state;
        const { onClose } = this.props;

        return (
            <div>
                <div className={styles.successBody}>
                    <span className={styles.successIcon} />
                    <div className={styles.successDescription}>
                        <Message
                            key="youMessageReceived"
                            defaultMessage="Your message was received. We will respond to you shortly. The answer will come to your E‑mail:"
                        />
                    </div>
                    <div className={styles.sentToEmail}>{email}</div>
                </div>

                <div className={styles.footer}>
                    <Button label={labels.close} block onClick={onClose} data-testid="feedback-popup-close-button" />
                </div>
            </div>
        );
    }

    onSubmit = (): Promise<void> => {
        if (this.state.isLoading) {
            return Promise.resolve();
        }

        this.setState({ isLoading: true });

        return feedback
            .send(this.form.serialize())
            .then(() =>
                this.setState({
                    isSuccessfullySent: true,
                    lastEmail: this.form.value('email'),
                }),
            )
            .catch((resp) => {
                if (resp.errors) {
                    this.form.setErrors(resp.errors);

                    return;
                }

                logger.warn('Error sending feedback', resp);
            })
            .finally(() => this.setState({ isLoading: false }));
    };
}

export default connect((state: RootState) => ({
    user: state.user,
}))(ContactForm);
