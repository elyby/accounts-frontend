import React from 'react';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './ResendActivation.intl.json';
import Body from './ResendActivationBody';

export default function ResendActivation() {
    return {
        Title: () => <AuthTitle title={messages.title} />,
        Body,
        Footer: () => <Button color="blue" label={messages.sendNewEmail} type="submit" />,
        Links: () => null
    };
}
