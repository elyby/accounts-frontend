import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { ScrollIntoView } from 'app/components/ui/scroll';
import styles from 'app/components/profile/profileForm.scss';
import icons from 'app/components/ui/icons.scss';

import mfaStyles from './mfa.scss';

export default function MfaStatus({ onProceed }: { onProceed: () => void }) {
    return (
        <div className={styles.formBody}>
            <ScrollIntoView />

            <div className={styles.formRow}>
                <div className={mfaStyles.bigIcon}>
                    <span className={icons.lock} />
                </div>
                <p className={`${styles.description} ${mfaStyles.mfaTitle}`}>
                    <Message
                        key="mfaEnabledForYourAcc"
                        defaultMessage="Two‑factor authentication for your account is active now"
                    />
                </p>
            </div>

            <div className={styles.formRow}>
                <p className={styles.description}>
                    <Message
                        key="mfaLoginFlowDesc"
                        defaultMessage="Additional code will be requested next time you log in. Please note, that Minecraft authorization won't work when two‑factor auth is enabled."
                    />
                </p>
            </div>

            <div className={`${styles.formRow} ${mfaStyles.disableMfa}`}>
                <p className={styles.description}>
                    <a
                        href="#"
                        onClick={(event) => {
                            event.preventDefault();
                            onProceed();
                        }}
                    >
                        <Message key="disable" defaultMessage="Disable" />
                    </a>
                </p>
            </div>
        </div>
    );
}
