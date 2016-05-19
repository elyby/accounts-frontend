import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';

import Body from './ChangePasswordBody';
import messages from './ChangePassword.intl.json';

export default function ChangePassword() {
    return {
        Title: () => <AuthTitle title={messages.changePasswordTitle} />,
        Body,
        Footer: () => <Button color="darkBlue" label={messages.change} type="submit" />,
        Links: () => <RejectionLink label={messages.skipThisStep} />
    };
}
