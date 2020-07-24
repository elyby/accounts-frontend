import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './MfaBody';

const messages = defineMessages({
    enterTotp: 'Enter code',
});

export default factory({
    title: messages.enterTotp,
    body: Body,
    footer: {
        color: 'green',
        children: <Message key="signInButton" defaultMessage="Sign in" />,
    },
});
