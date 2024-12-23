import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';

interface Props {
    title: MessageDescriptor;
}

const AuthTitle: FC<Props> = ({ title }) => {
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
};

export default AuthTitle;
