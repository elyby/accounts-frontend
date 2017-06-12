import factory from 'components/auth/factory';

import messages from './Activation.intl.json';
import Body from './ActivationBody';

export default factory({
    title: messages.accountActivationTitle,
    body: Body,
    footer: {
        color: 'blue',
        label: messages.confirmEmail
    },
    links: {
        label: messages.didNotReceivedEmail
    }
});
