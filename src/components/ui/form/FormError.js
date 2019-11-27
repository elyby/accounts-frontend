import PropTypes from 'prop-types';
import React from 'react';

import errorsDict from 'services/errorsDict';

import styles from './form.scss';

export default function FormError({ error }) {
  return error ? (
    <div className={styles.fieldError}>{errorsDict.resolve(error)}</div>
  ) : null;
}

FormError.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      payload: PropTypes.object.isRequired,
    }),
  ]),
};
