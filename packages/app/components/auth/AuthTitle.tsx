import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';

export default function AuthTitle({ title }: { title: MessageDescriptor }) {
    return (
        <Message {...title}>
            {(msg) => (
                <span>
                    {msg}
                    <Helmet title={msg as string} />
                </span>
            )}
        </Message>
    );
}
