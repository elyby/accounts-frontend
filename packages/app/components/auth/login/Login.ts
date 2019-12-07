import factory from '../factory';
import Body from './LoginBody';
import messages from './Login.intl.json';

export default factory({
  title: messages.loginTitle,
  body: Body,
  footer: {
    color: 'green',
    label: messages.next,
  },
  links: {
    isAvailable: context => !context.user.isGuest,
    label: messages.createNewAccount,
  },
});
