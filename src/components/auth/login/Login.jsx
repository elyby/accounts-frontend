import React from 'react';

import { Button } from 'components/ui/form';
import AuthTitle from 'components/auth/AuthTitle';

import Body from './LoginBody';
import messages from './Login.intl.json';

export default function Login() {
    return {
        Title: () => <AuthTitle title={messages.loginTitle} />,
        Body,
        Footer: () => <Button color="green" label={messages.next} type="submit" />,
        Links: () => null
    };
}

