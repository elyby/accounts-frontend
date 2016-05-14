import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './ForgotPassword.intl.json';
import Body from './ForgotPasswordBody';

export default function ForgotPassword() {
    return {
        Title: () => <AuthTitle title={messages.forgotPasswordTitle} />,
        Body,
        Footer: () => <Button color="lightViolet" label={messages.sendMail} />,
        Links: () => (
            <a href="/send-message">
                <Message {...messages.contactSupport} />
            </a>
        )
    };
}
