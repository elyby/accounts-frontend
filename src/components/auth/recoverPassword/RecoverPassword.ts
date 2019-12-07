import factory from '../factory';
import messages from './RecoverPassword.intl.json';
import Body from './RecoverPasswordBody';

export default factory({
  title: messages.title,
  body: Body,
  footer: {
    color: 'lightViolet',
    label: messages.change,
  },
  links: {
    label: messages.contactSupport,
  },
});
