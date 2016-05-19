import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './Activation.intl.json';
import Body from './ActivationBody';

export default function Activation() {
    return {
        Title: () => <AuthTitle title={messages.accountActivationTitle} />,
        Body,
        Footer: () => <Button color="blue" label={messages.confirmEmail} type="submit" />,
        Links: () => <RejectionLink label={messages.didNotReceivedEmail} />
    };
}
