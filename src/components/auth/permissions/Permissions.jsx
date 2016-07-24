import factory from 'components/auth/factory';
import messages from './Permissions.intl.json';
import Body from './PermissionsBody';

export default factory({
    title: messages.permissionsTitle,
    body: Body,
    footer: {
        color: 'orange',
        autoFocus: true,
        label: messages.approve
    },
    links: {
        label: messages.decline
    }
});

