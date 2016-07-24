import factory from 'components/auth/factory';

import Body from './ChangePasswordBody';
import messages from './ChangePassword.intl.json';

export default factory({
    title: messages.changePasswordTitle,
    body: Body,
    footer: {
        color: 'darkBlue',
        label: messages.change
    },
    links: {
        label: messages.skipThisStep
    }
});
