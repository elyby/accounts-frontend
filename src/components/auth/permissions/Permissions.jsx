import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './Permissions.intl.json';
import Body from './PermissionsBody';

export default function Permissions() {
    return {
        Title: () => <AuthTitle title={messages.permissionsTitle} />,
        Body,
        Footer: () => <Button color="orange" autoFocus label={messages.approve} />,
        Links: () => <RejectionLink label={messages.decline} />
    };
}
