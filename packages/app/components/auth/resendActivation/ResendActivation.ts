import factory from '../factory';
import forgotPasswordMessages from '../forgotPassword/ForgotPassword.intl.json';
import messages from './ResendActivation.intl.json';
import Body from './ResendActivationBody';

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'blue',
        label: messages.sendNewEmail,
    },
    links: {
        label: forgotPasswordMessages.alreadyHaveCode,
    },
});
