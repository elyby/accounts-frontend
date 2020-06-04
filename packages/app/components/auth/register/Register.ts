import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './RegisterBody';

const messages = defineMessages({
    registerTitle: 'Sign Up',
    signUpButton: 'Register',
    didNotReceivedEmail: 'Did not received E‑mail?',
    alreadyHaveCode: 'Already have a code',
});

export default factory({
    title: messages.registerTitle,
    body: Body,
    footer: {
        color: 'blue',
        label: messages.signUpButton,
    },
    links: [
        {
            label: messages.didNotReceivedEmail,
            payload: { requestEmail: true },
        },
        {
            label: messages.alreadyHaveCode,
        },
    ],
});
