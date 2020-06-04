import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './RecoverPasswordBody';

const messages = defineMessages({
    title: 'Restore password',
    contactSupport: 'Contact support',
    change: 'Change password',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'lightViolet',
        label: messages.change,
    },
    links: {
        label: messages.contactSupport,
    },
});
