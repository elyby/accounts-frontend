import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './LoginBody';

const messages = defineMessages({
    createNewAccount: 'Create new account',
    loginTitle: 'Sign in',
});

export default factory({
    title: messages.loginTitle,
    body: Body,
    footer: {
        color: 'green',
        children: <Message key="next" defaultMessage="Next" />,
    },
    links: {
        isAvailable: (context) => !context.user.isGuest,
        label: messages.createNewAccount,
    },
});
