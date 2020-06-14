import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './LoginBody';

const messages = defineMessages({
    createNewAccount: 'Create new account',
    loginTitle: 'Sign in',
    next: 'Next',
});

export default factory({
    title: messages.loginTitle,
    body: Body,
    footer: {
        color: 'green',
        label: messages.next,
    },
    links: {
        isAvailable: (context) => !context.user.isGuest,
        label: messages.createNewAccount,
    },
});
