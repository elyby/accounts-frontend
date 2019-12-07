import factory from '../factory';
import activationMessages from '../activation/Activation.intl.json';
import forgotPasswordMessages from '../forgotPassword/ForgotPassword.intl.json';
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
