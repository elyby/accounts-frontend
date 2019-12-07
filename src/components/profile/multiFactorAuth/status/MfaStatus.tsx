import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { ScrollIntoView } from 'components/ui/scroll';
import styles from 'components/profile/profileForm.scss';
import icons from 'components/ui/icons.scss';

import messages from '../MultiFactorAuth.intl.json';
import mfaStyles from '../mfa.scss';

export default function MfaStatus({ onProceed }: { onProceed: () => void }) {
  return (
    <div className={styles.formBody}>
      <ScrollIntoView />

      <div className={styles.formRow}>
        <div className={mfaStyles.bigIcon}>
          <span className={icons.lock} />
        </div>
        <p className={`${styles.description} ${mfaStyles.mfaTitle}`}>
          <Message {...messages.mfaEnabledForYourAcc} />
        </p>
      </div>

      <div className={styles.formRow}>
        <p className={styles.description}>
          <Message {...messages.mfaLoginFlowDesc} />
        </p>
      </div>

      <div className={`${styles.formRow} ${mfaStyles.disableMfa}`}>
        <p className={styles.description}>
          <a
            href="#"
            onClick={event => {
              event.preventDefault();
              onProceed();
            }}
          >
            <Message {...messages.disable} />
          </a>
        </p>
      </div>
    </div>
  );
}
