import React, { PropTypes } from 'react';

import errorsDict from 'services/errorsDict';
import { PanelBodyHeader } from 'components/ui/Panel';

export default function AuthError({error, onClose = function() {}}) {
    return (
        <PanelBodyHeader type="error" onClose={onClose}>
            {errorsDict.resolve(error)}
        </PanelBodyHeader>
    );
}

AuthError.displayName = 'AuthError';
AuthError.propTypes = {
    error: PropTypes.string.isRequired,
    onClose: PropTypes.func
};
