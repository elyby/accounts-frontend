import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './AcceptRulesBody';

const messages = defineMessages({
    title: 'User Agreement',
    declineAndLogout: 'Decline and logout',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'darkBlue',
        autoFocus: true,
        children: <Message key="accept" defaultMessage="Accept" />,
    },
    links: {
        label: messages.declineAndLogout,
    },
});
