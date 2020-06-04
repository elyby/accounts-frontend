import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';

import { Input, Form, FormModel } from 'app/components/ui/form';
import profileForm from 'app/components/profile/profileForm.scss';

const messages = defineMessages({
    codePlaceholder: 'Enter the code here',
});

export default function Confirmation({
    form,
    formRef = () => {},
    onSubmit,
    onInvalid,
}: {
    form: FormModel;
    formRef?: (el: Form | null) => void;
    onSubmit: (form: FormModel) => Promise<void> | void;
    onInvalid: () => void;
}) {
    return (
        <Form form={form} onSubmit={onSubmit} onInvalid={onInvalid} ref={formRef}>
            <div className={profileForm.formBody}>
                <div className={profileForm.formRow}>
                    <p className={profileForm.description}>
                        <Message
                            key="enterCodeFromApp"
                            defaultMessage="In order to finish two‑factor auth setup, please enter the code received in the mobile app:"
                        />
                    </p>
                </div>

                <div className={profileForm.formRow}>
                    <Input
                        {...form.bindField('totp')}
                        required
                        autoComplete="off"
                        skin="light"
                        placeholder={messages.codePlaceholder}
                    />
                </div>
            </div>
        </Form>
    );
}
