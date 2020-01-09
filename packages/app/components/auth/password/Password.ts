import factory from '../factory';
import Body from './PasswordBody';
import messages from './Password.intl.json';

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
