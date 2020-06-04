import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './PermissionsBody';

const messages = defineMessages({
    permissionsTitle: 'Application permissions',
    decline: 'Decline',
    approve: 'Approve',
});

export default factory({
    title: messages.permissionsTitle,
    body: Body,
    footer: {
        color: 'orange',
        autoFocus: true,
        label: messages.approve,
    },
    links: {
        label: messages.decline,
    },
});
