import factory from 'components/auth/factory';

import Body from './AcceptRulesBody';
import messages from './AcceptRules.intl.json';

export default factory({
    title: messages.title,
    body: Body,
    footer: {
        color: 'darkBlue',
        autoFocus: true,
        label: messages.accept
    },
    links: {
        label: messages.declineAndLogout
    }
});
