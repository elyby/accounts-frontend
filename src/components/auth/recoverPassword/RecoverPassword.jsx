import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';
import changePassword from 'components/auth/changePassword/ChangePassword.intl.json';

import messages from './RecoverPassword.intl.json';
import Body from './RecoverPasswordBody';

export default function RecoverPassword() {
    return {
        Title: () => <AuthTitle title={messages.title} />,
        Body,
        Footer: () => <Button color="lightViolet" label={changePassword.change} />,
        Links: () => <RejectionLink label={messages.contactSupport} />
    };
}
