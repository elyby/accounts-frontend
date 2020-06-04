import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './ActivationBody';

const messages = defineMessages({
    accountActivationTitle: 'Account activation',
    confirmEmail: 'Confirm E‑mail',
    didNotReceivedEmail: 'Did not received E‑mail?',
});

export default factory({
    title: messages.accountActivationTitle,
    body: Body,
    footer: {
        color: 'blue',
        label: messages.confirmEmail,
    },
    links: {
        label: messages.didNotReceivedEmail,
    },
});
