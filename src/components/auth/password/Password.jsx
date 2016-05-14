import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';

import Body from './PasswordBody';
import messages from './Password.intl.json';

export default function Password() {
    return {
        Title: () => <AuthTitle title={messages.passwordTitle} />,
        Body,
        Footer: () => <Button color="green" label={messages.signInButton} />,
        Links: () => <RejectionLink label={messages.forgotPassword} />
    };
}
