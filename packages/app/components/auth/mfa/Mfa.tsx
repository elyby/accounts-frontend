import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './MfaBody';

const messages = defineMessages({
    enterTotp: 'Enter code',
    signInButton: 'Sign in',
});

export default factory({
    title: messages.enterTotp,
    body: Body,
    footer: {
        color: 'green',
        label: messages.signInButton,
    },
});
