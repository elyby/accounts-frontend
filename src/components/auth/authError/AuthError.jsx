import React, { Component, PropTypes } from 'react';

import errorsDict from 'services/errorsDict';
import { PanelBodyHeader } from 'components/ui/Panel';

export default class AuthError extends Component {
    static displayName = 'AuthError';

    static propTypes = {
        error: PropTypes.string.isRequired,
        onClose: PropTypes.func
    };

    render() {
        let { error } = this.props;

        error = errorsDict.resolve(error);

        return (
            <PanelBodyHeader type="error" onClose={this.props.onClose}>
                {error}
            </PanelBodyHeader>
        );
    }
}
