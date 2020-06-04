import { defineMessages } from 'react-intl';
import factory from '../factory';
import Body from './ChooseAccountBody';

const messages = defineMessages({
    chooseAccountTitle: 'Choose an account',
    addAccount: 'Log into another account',
    logoutAll: 'Log out from all accounts',
});

export default factory({
    title: messages.chooseAccountTitle,
    body: Body,
    footer: {
        label: messages.addAccount,
    },
    links: [
        {
            label: messages.logoutAll,
        },
    ],
});
