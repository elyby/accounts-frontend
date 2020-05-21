import React, { ComponentType, ReactNode } from 'react';
import { resolve as resolveError } from 'app/services/errorsDict';
import { MessageDescriptor } from 'react-intl';

import styles from './form.scss';

interface Props {
  error?: Parameters<typeof resolveError>[0] | MessageDescriptor | null;
}

function isMessageDescriptor(
  message: Props['error'],
): message is MessageDescriptor {
  return (
    typeof message === 'object' &&
    typeof (message as MessageDescriptor).id !== 'undefined'
  );
}

const FormError: ComponentType<Props> = ({ error }) => {
  if (!error) {
    return null;
  }

  let content: ReactNode;

  if (isMessageDescriptor(error)) {
    content = error;
  } else {
    content = resolveError(error);
  }

  return (
    <div className={styles.fieldError} role="alert">
      {content}
    </div>
  );
};

export default FormError;
