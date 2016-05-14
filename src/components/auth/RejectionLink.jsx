import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

export default function RejectionLink(props, context) {
    return (
        <a href="#" onClick={(event) => {
            event.preventDefault();

            context.reject();
        }}>
            <Message {...props.label} />
        </a>
    );
}

RejectionLink.displayName = 'RejectionLink';
RejectionLink.propTypes = {
    label: PropTypes.shape({
        id: PropTypes.string
    }).isRequired
};
RejectionLink.contextTypes = {
    reject: PropTypes.func.isRequired
};
