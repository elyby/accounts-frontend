import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './ActivationBody';

const messages = defineMessages({
    accountActivationTitle: 'Account activation',
    didNotReceivedEmail: 'Did not received E‑mail?',
});

export default factory({
    title: messages.accountActivationTitle,
    body: Body,
    footer: {
        color: 'blue',
        children: <Message key="confirmEmail" defaultMessage="Confirm E‑mail" />,
    },
    links: {
        label: messages.didNotReceivedEmail,
    },
});
