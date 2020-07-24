import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './ResendActivationBody';

const messages = defineMessages({
    title: 'Did not received an E‑mail',
    alreadyHaveCode: 'Already have a code',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'blue',
        children: <Message key="sendNewEmail" defaultMessage="Send new E‑mail" />,
    },
    links: {
        label: messages.alreadyHaveCode,
    },
});
