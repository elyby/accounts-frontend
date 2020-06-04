import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './PasswordBody';

const messages = defineMessages({
    passwordTitle: 'Enter password',
    signInButton: 'Sign in',
    forgotPassword: 'Forgot password',
});

export default factory({
    title: messages.passwordTitle,
    body: Body,
    footer: {
        color: 'green',
        label: messages.signInButton,
    },
    links: {
        label: messages.forgotPassword,
    },
});
