import React, { ComponentType, useEffect } from 'react';

import { resolve as resolveError } from 'app/services/errorsDict';
import { PanelBodyHeader } from 'app/components/ui/Panel';
import { ValidationError } from 'app/components/ui/form/FormModel';

interface Props {
    error: ValidationError;
    onClose?: () => void;
}

let autoHideTimer: number | null = null;
function resetTimeout(): void {
    if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        autoHideTimer = null;
    }
}

const AuthError: ComponentType<Props> = ({ error, onClose }) => {
    useEffect(() => {
        resetTimeout();

        if (onClose && typeof error !== 'string' && error.payload && error.payload.canRepeatIn) {
            const msLeft = error.payload.canRepeatIn * 1000;
            // 1500 to let the user see, that time is elapsed
            setTimeout(onClose, msLeft - Date.now() + 1500);
        }

        return resetTimeout;
    }, [error, onClose]);

    return (
        <PanelBodyHeader type="error" onClose={onClose} data-testid="auth-error">
            {resolveError(error)}
        </PanelBodyHeader>
    );
};

export default AuthError;
