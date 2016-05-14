import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import Body from './ChangePasswordBody';
import messages from './ChangePassword.intl.json';

export default function ChangePassword() {
    const componentsMap = {
        Title: () => <AuthTitle title={messages.changePasswordTitle} />,
        Body,
        Footer: () => <Button color="darkBlue" label={messages.change} />,
        Links: (props, context) => (
            <a href="#" onClick={(event) => {
                event.preventDefault();

                context.reject();
            }}>
                <Message {...messages.skipThisStep} />
            </a>
        )
    };

    componentsMap.Links.contextTypes = {
        reject: PropTypes.func.isRequired
    };

    return componentsMap;
}
