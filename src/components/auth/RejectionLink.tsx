import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';
import { User } from 'components/user';
import { userShape } from 'components/user/User';

interface Props {
  isAvailable?: (context: Context) => boolean;
  payload?: { [key: string]: any };
  label: MessageDescriptor;
}

export type RejectionLinkProps = Props;

interface Context {
  reject: (payload: { [key: string]: any } | undefined) => void;
  user: User;
}

function RejectionLink(props: Props, context: Context) {
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

RejectionLink.contextTypes = {
  reject: PropTypes.func.isRequired,
  user: userShape,
};

export default RejectionLink;
