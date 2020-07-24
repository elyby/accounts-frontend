import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './PasswordBody';

const messages = defineMessages({
    passwordTitle: 'Enter password',
    forgotPassword: 'Forgot password',
});

export default factory({
    title: messages.passwordTitle,
    body: Body,
    footer: {
        color: 'green',
        children: <Message key="signInButton" defaultMessage="Sign in" />,
    },
    links: {
        label: messages.forgotPassword,
    },
});
