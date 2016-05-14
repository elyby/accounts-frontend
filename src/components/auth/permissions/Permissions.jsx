import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import messages from './Permissions.intl.json';
import Body from './PermissionsBody';

export default function Permissions() {
    const componentsMap = {
        Title: () => <AuthTitle title={messages.permissionsTitle} />,
        Body,
        Footer: () => <Button color="orange" autoFocus label={messages.approve} />,
        Links: (props, context) => (
            <a href="#" onClick={(event) => {
                event.preventDefault();

                context.reject();
            }}>
                <Message {...messages.decline} />
            </a>
        )
    };

    componentsMap.Links.contextTypes = {
        reject: PropTypes.func.isRequired
    };

    return componentsMap;
}
