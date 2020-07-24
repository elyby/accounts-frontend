import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './PermissionsBody';

const messages = defineMessages({
    permissionsTitle: 'Application permissions',
    decline: 'Decline',
});

export default factory({
    title: messages.permissionsTitle,
    body: Body,
    footer: {
        color: 'orange',
        autoFocus: true,
        children: <Message key="approve" defaultMessage="Approve" />,
    },
    links: {
        label: messages.decline,
    },
});
