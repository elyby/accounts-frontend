// @flow
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input, FormModel } from 'components/ui/form';

import profileForm from 'components/profile/profileForm.scss';
import messages from '../MultiFactorAuth.intl.json';

export default function Confirmation({
    form,
    isActiveStep,
    onCodeInput
}: {
    form: FormModel,
    isActiveStep: bool,
    onCodeInput: (event: Event & {target: HTMLInputElement}) => void
}) {
    return (
        <div className={profileForm.formBody}>
            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.enterCodeFromApp} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <Input {...form.bindField('key')}
                    required={isActiveStep}
                    onChange={onCodeInput}
                    autoComplete="off"
                    skin="light"
                    color="violet"
                    placeholder={messages.codePlaceholder}
                />
            </div>
        </div>
    );
}
