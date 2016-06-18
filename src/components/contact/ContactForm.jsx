import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { FormattedMessage as Message } from 'react-intl';

import { Input, TextArea, Button, Form, FormModel, Dropdown } from 'components/ui/form';
import feedback from 'services/api/feedback';
import icons from 'components/ui/icons.scss';
import popupStyles from 'components/ui/popup/popup.scss';

import styles from './contactForm.scss';
import messages from './contactForm.intl.json';

const CONTACT_CATEGORIES = [
    // TODO: сюда позже проставить реальные id категорий с backend
    <Message {...messages.cannotAccessMyAccount} />,
    <Message {...messages.foundBugOnSite} />,
    <Message {...messages.improvementsSuggestion} />,
    <Message {...messages.integrationQuestion} />,
    <Message {...messages.other} />
];

class ContactForm extends Component {
    static displayName = 'ContactForm';

    static propTypes = {
        onClose: PropTypes.func.isRequired,
        user: PropTypes.shape({
            email: PropTypes.string
        }).isRequired
    };

    form = new FormModel();

    render() {
        const {isSuccessfullySent = false} = this.state || {};
        const {onClose} = this.props;

        return (
            <div className={styles.contactForm}>
                <div className={popupStyles.popup}>
                    <div className={popupStyles.header}>
                        <h2 className={popupStyles.headerTitle}>
                            <Message {...messages.title} />
                        </h2>
                        <span className={classNames(icons.close, popupStyles.close)} onClick={onClose} />
                    </div>

                    {isSuccessfullySent
                        ? (<div>Hello world<Button onClick={onClose} label="Close" /></div>)
                        : this.renderForm()
                    }
                </div>
            </div>
        );
    }

    renderForm() {
        const {form} = this;
        const {user} = this.props;

        return (
            <Form form={form} onSubmit={this.onSubmit}>
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
                    <Button label={messages.send} block />
                </div>
            </Form>
        );
    }

    onSubmit = () => {
        feedback(this.form.serialize())
            .then(() => this.setState({isSuccessfullySent: true}))
            .catch((resp) => {
                if (resp.errors) {
                    this.form.setErrors(resp.errors);
                }

                return Promise.reject(resp);
            })
            ;
    };
}

import { connect } from 'react-redux';

export default connect((state) => ({
    user: state.user
}))(ContactForm);
