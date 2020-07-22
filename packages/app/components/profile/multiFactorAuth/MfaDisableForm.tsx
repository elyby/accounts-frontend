import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Button, Input, Form, FormModel } from 'app/components/ui/form';
import styles from 'app/components/profile/profileForm.scss';

import mfaStyles from './mfa.scss';

const messages = defineMessages({
    codePlaceholder: 'Enter the code here',
});

export default class MfaDisableForm extends React.Component<{
    onSubmit: (form: FormModel) => Promise<void>;
}> {
    form: FormModel = new FormModel();

    render() {
        const { form } = this;
        const { onSubmit } = this.props;

        return (
            <Form form={form} onSubmit={onSubmit}>
                <div className={styles.formBody}>
                    <div className={styles.formRow}>
                        <p className={`${styles.description} ${mfaStyles.mfaTitle}`}>
                            <Message key="disableMfa" defaultMessage="Disable two‑factor authentication" />
                        </p>
                    </div>

                    <div className={styles.formRow}>
                        <p className={styles.description}>
                            <Message
                                key="disableMfaInstruction"
                                defaultMessage="In order to disable two‑factor authentication, you need to provide a code from your mobile app and confirm your action with your current account password."
                            />
                        </p>
                    </div>

                    <div className={styles.formRow}>
                        <Input
                            {...form.bindField('totp')}
                            required
                            autoFocus
                            autoComplete="off"
                            skin="light"
                            placeholder={messages.codePlaceholder}
                        />
                    </div>
                </div>

                <Button type="submit" color="green" block>
                    <Message key="disable" defaultMessage="Disable" />
                </Button>
            </Form>
        );
    }
}
