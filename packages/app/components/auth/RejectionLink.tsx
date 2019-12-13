import React, { useContext } from 'react';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';

import Context, { AuthContext } from './Context';

interface Props {
  isAvailable?: (context: AuthContext) => boolean;
  payload?: { [key: string]: any };
  label: MessageDescriptor;
}

export type RejectionLinkProps = Props;

function RejectionLink(props: Props) {
  const context = useContext(Context);

  if (props.isAvailable && !props.isAvailable(context)) {
    // TODO: if want to properly support multiple links, we should control
    // the dividers ' | ' rendered from factory too
    return null;
  }

  return (
    <a
      href="#"
      onClick={event => {
        event.preventDefault();

        context.reject(props.payload);
      }}
    >
      <Message {...props.label} />
    </a>
  );
}

export default RejectionLink;
