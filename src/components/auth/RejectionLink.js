import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { userShape } from 'components/user/User';

export default function RejectionLink(props, context) {
    if (props.isAvailable && !props.isAvailable(context)) {
        // TODO: if want to properly support multiple links, we should control
        // the dividers ' | ' rendered from factory too
        return null;
    }

    return (
        <a href="#" onClick={(event) => {
            event.preventDefault();

            context.reject(props.payload);
        }}>
            <Message {...props.label} />
        </a>
    );
}

RejectionLink.displayName = 'RejectionLink';
RejectionLink.propTypes = {
    isAvailable: PropTypes.func, // a function from context to allow link visibility control
    // eslint-disable-next-line react/forbid-prop-types
    payload: PropTypes.object, // Custom payload for active state
    label: PropTypes.shape({
        id: PropTypes.string
    }).isRequired
};
RejectionLink.contextTypes = {
    reject: PropTypes.func.isRequired,
    user: userShape
};
