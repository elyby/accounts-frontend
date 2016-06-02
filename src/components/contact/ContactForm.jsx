import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { FormattedMessage as Message } from 'react-intl';

import { Input, TextArea, Button, Form, FormModel, Dropdown } from 'components/ui/form';
import site from 'services/api/site';
import icons from 'components/ui/icons.scss';
import popupStyles from 'components/ui/popup/popup.scss';

import styles from './contactForm.scss';
import messages from './contactForm.intl.json';

const CONTACT_CATEGORIES = ['Foo', 'Bar', 'Baz'];

export default class ContactForm extends Component {
    static displayName = 'ContactForm';

    static propTypes = {
        onClose: PropTypes.func.isRequired
    };

    form = new FormModel();

    render() {
        const {onClose} = this.props;
        const {form} = this;

        return (
            <div className={styles.contactForm}>
                <div className={popupStyles.header}>
                    <h2 className={popupStyles.headerTitle}>
                        <Message {...messages.title} />
                    </h2>
                    <span className={classNames(icons.close, popupStyles.close)} onClick={onClose} />
                </div>

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
                                />
                            </div>
                        </div>

                        <div className={styles.formMargin}>
                            <Dropdown label={messages.whichQuestion} items={CONTACT_CATEGORIES} block />
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
            </div>
        );
    }

    onSubmit = () => {
        site.contact(this.form.serialize())
            .then(this.props.onClose)
            .catch((resp) => {
                if (resp.errors) {
                    this.form.setErrors(resp.errors);
                }

                return Promise.reject(resp);
            })
            ;
    };
}
