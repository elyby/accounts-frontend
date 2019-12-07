import factory from '../factory';
import messages from './ForgotPassword.intl.json';
import Body from './ForgotPasswordBody';

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
