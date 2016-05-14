import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import Body from './PasswordBody';
import messages from './Password.intl.json';

export default function Password() {
    return {
        Title: () => <AuthTitle title={messages.passwordTitle} />,
        Body,
        Footer: () => <Button color="green" label={messages.signInButton} />,
        Links: () => (
            <Link to="/forgot-password">
                <Message {...messages.forgotPassword} />
            </Link>
        )
    };
}
