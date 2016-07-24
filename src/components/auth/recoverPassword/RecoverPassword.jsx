import factory from 'components/auth/factory';
import changePassword from 'components/auth/changePassword/ChangePassword.intl.json';

import messages from './RecoverPassword.intl.json';
import Body from './RecoverPasswordBody';

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'lightViolet',
        label: changePassword.change
    },
    links: {
        label: messages.contactSupport
    }
});
