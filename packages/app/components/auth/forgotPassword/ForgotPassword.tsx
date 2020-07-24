import React from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './ForgotPasswordBody';

const messages = defineMessages({
    title: 'Forgot password',
    alreadyHaveCode: 'Already have a code',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'lightViolet',
        autoFocus: true,
        children: <Message key="sendMail" defaultMessage="Send mail" />,
    },
    links: {
        label: messages.alreadyHaveCode,
    },
});
