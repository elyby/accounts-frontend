import factory from 'components/auth/factory';
import messages from './ChooseAccount.intl.json';
import Body from './ChooseAccountBody';

export default factory({
    title: messages.chooseAccountTitle,
    body: Body,
    footer: {
        label: messages.addAccount
    },
    links: [
        {
            label: messages.createNewAccount
        },
        {
            label: messages.logoutAll,
            payload: {logout: true}
        }
    ]
});
