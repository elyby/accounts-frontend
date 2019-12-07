import React from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';

export default function AuthTitle({ title }: { title: MessageDescriptor }) {
  return (
    <Message {...title}>
      {msg => (
        <span>
          {msg}
          <Helmet title={msg} />
        </span>
      )}
    </Message>
  );
}
