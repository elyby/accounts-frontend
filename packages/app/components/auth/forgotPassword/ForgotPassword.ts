import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './ForgotPasswordBody';

const messages = defineMessages({
    title: 'Forgot password',
    sendMail: 'Send mail',
    alreadyHaveCode: 'Already have a code',
});

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'lightViolet',
        autoFocus: true,
        label: messages.sendMail,
    },
    links: {
        label: messages.alreadyHaveCode,
    },
});
