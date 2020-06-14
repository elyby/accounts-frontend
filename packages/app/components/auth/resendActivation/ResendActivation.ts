import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './ResendActivationBody';

const messages = defineMessages({
    title: 'Did not received an E‑mail',
    sendNewEmail: 'Send new E‑mail',
    alreadyHaveCode: 'Already have a code',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'blue',
        label: messages.sendNewEmail,
    },
    links: {
        label: messages.alreadyHaveCode,
    },
});
