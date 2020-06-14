import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './AcceptRulesBody';

const messages = defineMessages({
    title: 'User Agreement',
    accept: 'Accept',
    declineAndLogout: 'Decline and logout',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'darkBlue',
        autoFocus: true,
        label: messages.accept,
    },
    links: {
        label: messages.declineAndLogout,
    },
});
