import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './DeviceCodeBody';

const messages = defineMessages({
    deviceCodeTitle: 'Device code',
});

export default factory({
    title: messages.deviceCodeTitle,
    body: Body,
    footer: {
        color: 'green',
        children: <Message key="continueButton" defaultMessage="Continue" />,
    },
});
