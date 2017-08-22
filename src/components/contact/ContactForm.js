import PropTypes from 'prop-types';
import React, { Component } from 'react';

import classNames from 'classnames';
import { FormattedMessage as Message } from 'react-intl';

import { Input, TextArea, Button, Form, FormModel, Dropdown } from 'components/ui/form';
import feedback from 'services/api/feedback';
import icons from 'components/ui/icons.scss';
import popupStyles from 'components/ui/popup/popup.scss';
import logger from 'services/logger';

import styles from './contactForm.scss';
import messages from './contactForm.intl.json';

const CONTACT_CATEGORIES = [
    // TODO: сюда позже проставить реальные id категорий с backend
    <Message key="m1" {...messages.cannotAccessMyAccount} />,
    <Message key="m2" {...messages.foundBugOnSite} />,
    <Message key="m3" {...messages.improvementsSuggestion} />,
    <Message key="m4" {...messages.integrationQuestion} />,
    <Message key="m5" {...messages.other} />
];

export class ContactForm extends Component {
    static displayName = 'ContactForm';

    static propTypes = {
        onClose: PropTypes.func,
        user: PropTypes.shape({
            email: PropTypes.string
        }).isRequired
    };

    static defaultProps = {
        onClose() {}
    };

    state = {
        isLoading: false,
        isSuccessfullySent: false
    };

    form = new FormModel();

    render() {
        const {isSuccessfullySent} = this.state || {};
        const {onClose} = this.props;

        return (
            <div className={isSuccessfullySent ? styles.successState : styles.contactForm}>
                <div className={popupStyles.popup}>
                    <div className={popupStyles.header}>
                        <h2 className={popupStyles.headerTitle}>
                            <Message {...messages.title} />
                        </h2>
                        <span className={classNames(icons.close, popupStyles.close)} onClick={onClose} />
                    </div>

                    {isSuccessfullySent ? this.renderSuccess() : this.renderForm()}
                </div>
            </div>
        );
    }

    renderForm() {
        const {form} = this;
        const {user} = this.props;
        const {isLoading} = this.state;

        return (
            <Form form={form}
                onSubmit={this.onSubmit}
                isLoading={isLoading}
            >
                <div className={popupStyles.body}>
                    <div className={styles.philosophicalThought}>
                        <Message {...messages.philosophicalThought} />
                    </div>

                    <div className={styles.formDisclaimer}>
                        <Message {...messages.disclaimer} /><br />
                    </div>

                    <div className={styles.pairInputRow}>
                        <div className={styles.pairInput}>
                            <Input
                                {...form.bindField('subject')}
                                required
                                label={messages.subject}
                                skin="light"
                            />
                        </div>

                        <div className={styles.pairInput}>
                            <Input
                                {...form.bindField('email')}
                                required
                                label={messages.email}
                                type="email"
                                skin="light"
                                defaultValue={user.email}
                            />
                        </div>
                    </div>

                    <div className={styles.formMargin}>
                        <Dropdown
                            {...form.bindField('category')}
                            label={messages.whichQuestion}
                            items={CONTACT_CATEGORIES}
                            block
                        />
                    </div>

                    <TextArea
                        {...form.bindField('message')}
                        required
                        label={messages.message}
                        skin="light"
                    />
                </div>

                <div className={styles.footer}>
                    <Button label={messages.send} block type="submit" />
                </div>
            </Form>
        );
    }

    renderSuccess() {
        const {lastEmail: email} = this.state;
        const {onClose} = this.props;

        return (
            <div>
                <div className={styles.successBody}>
                    <span className={styles.successIcon} />
                    <div className={styles.successDescription}>
                        <Message {...messages.youMessageReceived} />
                    </div>
                    <div className={styles.sentToEmail}>{email}</div>
                </div>

                <div className={styles.footer}>
                    <Button label={messages.close} block onClick={onClose} />
                </div>
            </div>
        );
    }

    onSubmit = () => {
        if (this.state.isLoading) {
            return;
        }

        this.setState({isLoading: true});
        return feedback.send(this.form.serialize())
            .then(() => this.setState({
                isSuccessfullySent: true,
                lastEmail: this.form.value('email')
            }))
            .catch((resp) => {
                if (resp.errors) {
                    this.form.setErrors(resp.errors);
                    return;
                }

                logger.warn('Error sending feedback', resp);
            })
            .finally(() => this.setState({isLoading: false}));
    };
}

import { connect } from 'react-redux';

export default connect((state) => ({
    user: state.user
}))(ContactForm);
