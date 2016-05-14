import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './ForgotPassword.intl.json';
import Body from './ForgotPasswordBody';

export default function ForgotPassword() {
    return {
        Title: () => <AuthTitle title={messages.forgotPasswordTitle} />,
        Body,
        Footer: () => <Button color="lightViolet" label={messages.sendMail} />,
        Links: () => <RejectionLink label={messages.contactSupport} />
    };
}
