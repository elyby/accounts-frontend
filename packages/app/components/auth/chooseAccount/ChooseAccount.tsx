import { FormattedMessage as Message, defineMessages } from 'react-intl';

import factory from '../factory';
import Body from './ChooseAccountBody';

const messages = defineMessages({
    chooseAccountTitle: 'Choose an account',
    logoutAll: 'Log out from all accounts',
});

export default factory({
    title: messages.chooseAccountTitle,
    body: Body,
    footer: {
        children: <Message key="addAccount" defaultMessage="Log into another account" />,
    },
    links: [
        {
            label: messages.logoutAll,
        },
    ],
});
