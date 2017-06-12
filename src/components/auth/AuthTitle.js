import React from 'react';

import Helmet from 'react-helmet';
import { FormattedMessage as Message } from 'react-intl';

export default function AuthTitle({title}) {
    return (
        <Message {...title}>
            {(msg) => <span>{msg}<Helmet title={msg} /></span>}
        </Message>
    );
}
