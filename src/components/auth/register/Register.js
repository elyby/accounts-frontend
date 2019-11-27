import factory from 'components/auth/factory';
import activationMessages from 'components/auth/activation/Activation.intl.json';
import forgotPasswordMessages from 'components/auth/forgotPassword/ForgotPassword.intl.json';

import messages from './Register.intl.json';
import Body from './RegisterBody';

export default factory({
  title: messages.registerTitle,
  body: Body,
  footer: {
    color: 'blue',
    label: messages.signUpButton,
  },
  links: [
    {
      label: activationMessages.didNotReceivedEmail,
      payload: { requestEmail: true },
    },
    {
      label: forgotPasswordMessages.alreadyHaveCode,
    },
  ],
});
