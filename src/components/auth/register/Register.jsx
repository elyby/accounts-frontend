import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';
import activationMessages from 'components/auth/activation/Activation.intl.json';

import messages from './Register.intl.json';
import Body from './RegisterBody';

export default function Register() {
    return {
        Title: () => <AuthTitle title={messages.registerTitle} />,
        Body,
        Footer: () => <Button color="blue" label={messages.signUpButton} />,
        Links: () => <RejectionLink label={activationMessages.didNotReceivedEmail} />
    };
}
