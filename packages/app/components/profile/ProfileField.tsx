import React from 'react';
import { Link } from 'react-router-dom';

import styles from './profile.scss';

function ProfileField({
  label,
  value,
  warningMessage,
  link,
  onChange,
}: {
  label: React.ReactNode;
  link?: string;
  onChange?: () => void;
  value: React.ReactNode;
  warningMessage?: React.ReactNode;
}) {
  let Action: React.ElementType | null = null;

  if (link) {
    Action = props => <Link to={link} {...props} />;
  }

  if (onChange) {
    Action = props => <a {...props} onClick={onChange} href="#" />;
  }

  return (
    <div className={styles.paramItem} data-testid="profile-item">
      <div className={styles.paramRow}>
        <div className={styles.paramName}>{label}</div>
        <div className={styles.paramValue}>{value}</div>

        {Action && (
          <Action
            to={link}
            className={styles.paramAction}
            data-testid="profile-action"
          >
            <span className={styles.paramEditIcon} />
          </Action>
        )}
      </div>

      {warningMessage && (
        <div className={styles.paramMessage}>{warningMessage}</div>
      )}
    </div>
  );
}

export default ProfileField;
