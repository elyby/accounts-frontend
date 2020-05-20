import React, { ComponentType, useContext } from 'react';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';

import Context, { AuthContext } from './Context';

interface Props {
  isAvailable?: (context: AuthContext) => boolean;
  payload?: Record<string, any>;
  label: MessageDescriptor;
}

const RejectionLink: ComponentType<Props> = ({
  isAvailable,
  payload,
  label,
}) => {
  const context = useContext(Context);

  if (isAvailable && !isAvailable(context)) {
    // TODO: if want to properly support multiple links, we should control
    // the dividers ' | ' rendered from factory too
    return null;
  }

  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();

        context.reject(payload);
      }}
    >
      <Message {...label} />
    </a>
  );
};

export default RejectionLink;
