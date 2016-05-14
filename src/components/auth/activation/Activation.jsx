import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './Activation.intl.json';
import Body from './ActivationBody';

export default function Activation() {
    return {
        Title: () => <AuthTitle title={messages.accountActivationTitle} />,
        Body,
        Footer: () => <Button color="blue" label={messages.confirmEmail} />,
        Links: () => (
            <a href="#">
                <Message {...messages.didNotReceivedEmail} />
            </a>
        )
    };
}
