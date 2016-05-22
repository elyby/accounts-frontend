import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { FormattedMessage as Message } from 'react-intl';

import { Input, TextArea, Button, Form, FormModel } from 'components/ui/form';
import site from 'services/api/site';
import icons from 'components/ui/icons.scss';

import styles from './contactForm.scss';
import messages from './contactForm.intl.json';

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
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <Message {...messages.title} />
                    </h2>
                    <span className={classNames(icons.close, styles.close)} onClick={onClose} />
                </div>

                <Form form={form} onSubmit={this.onSubmit}>
                    <Input
                        {...form.bindField('subject')}
                        required
                        label={messages.subject}
                        skin="light"
                    />

                    <Input
                        {...form.bindField('email')}
                        required
                        label={messages.email}
                        type="email"
                        skin="light"
                    />

                    <TextArea
                        {...form.bindField('message')}
                        required
                        label={messages.message}
                        skin="light"
                    />

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
