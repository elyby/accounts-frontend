import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';
import activationMessages from 'components/auth/activation/Activation.intl.json';

import messages from './Register.intl.json';
import Body from './RegisterBody';

export default function Register() {
    return {
        Title: () => <AuthTitle title={messages.registerTitle} />,
        Body,
        Footer: () => <Button color="blue" label={messages.signUpButton} />,
        Links: () => (
            <a href="#">
                <Message {...activationMessages.didNotReceivedEmail} />
            </a>
        )
    };
}
