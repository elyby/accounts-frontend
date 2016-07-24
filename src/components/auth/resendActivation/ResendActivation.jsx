import React from 'react';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';
import RejectionLink from 'components/auth/RejectionLink';
import forgotPasswordMessages from 'components/auth/forgotPassword/ForgotPassword.intl.json';

import messages from './ResendActivation.intl.json';
import Body from './ResendActivationBody';

export default function ResendActivation() {
    return {
        Title: () => <AuthTitle title={messages.title} />,
        Body,
        Footer: () => <Button color="blue" label={messages.sendNewEmail} type="submit" />,
        Links: () => <RejectionLink label={forgotPasswordMessages.alreadyHaveCode} />
    };
}
