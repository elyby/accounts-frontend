import PropTypes from 'prop-types';
import React from 'react';

import errorsDict from 'services/errorsDict';
import { PanelBodyHeader } from 'components/ui/Panel';

let autoHideTimer;
function resetTimer() {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
}
export default function AuthError({ error, onClose = function() {} }) {
  resetTimer();

  if (error.payload && error.payload.canRepeatIn) {
    error.payload.msLeft = error.payload.canRepeatIn * 1000;
    setTimeout(onClose, error.payload.msLeft - Date.now() + 1500); // 1500 to let the user see, that time is elapsed
  }

  return (
    <PanelBodyHeader
      type="error"
      onClose={() => {
        resetTimer();
        onClose();
      }}
    >
      {errorsDict.resolve(error)}
    </PanelBodyHeader>
  );
}

AuthError.displayName = 'AuthError';
AuthError.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      type: PropTypes.string,
      payload: PropTypes.object,
    }),
  ]).isRequired,
  onClose: PropTypes.func,
};
