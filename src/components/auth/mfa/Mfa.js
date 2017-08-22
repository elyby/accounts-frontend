// @flow
import factory from 'components/auth/factory';

import Body from './MfaBody';
import messages from './Mfa.intl.json';
import passwordMessages from '../password/Password.intl.json';

export default factory({
    title: messages.enterTotp,
    body: Body,
    footer: {
        color: 'green',
        label: passwordMessages.signInButton
    }
});
