import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './RecoverPasswordBody';

const messages = defineMessages({
    title: 'Restore password',
    contactSupport: 'Contact support',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'lightViolet',
        children: <Message key="change" defaultMessage="Change password" />,
    },
    links: {
        label: messages.contactSupport,
    },
});
