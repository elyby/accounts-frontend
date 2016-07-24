import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

export default function RejectionLink(props, context) {
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
    // eslint-disable-next-line react/forbid-prop-types
    payload: PropTypes.object, // Custom payload for active state
    label: PropTypes.shape({
        id: PropTypes.string
    }).isRequired
};
RejectionLink.contextTypes = {
    reject: PropTypes.func.isRequired
};
