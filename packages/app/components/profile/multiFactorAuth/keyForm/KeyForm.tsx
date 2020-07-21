import React, { ComponentType } from 'react';
import clsx from 'clsx';
import { FormattedMessage as Message } from 'react-intl';
import { ImageLoader } from 'app/components/ui/loader';
import profileForm from 'app/components/profile/profileForm.scss';

import messages from '../keyForm.intl';
import styles from './key-form.scss';

interface Props {
    secret: string;
    qrCodeSrc: string;
}

const KeyForm: ComponentType<Props> = ({ secret, qrCodeSrc }) => {
    const formattedSecret = formatSecret(secret || new Array(24).join('X'));

    return (
        <div className={profileForm.formBody}>
            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.scanQrCode} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.qrCode}>
                    <ImageLoader ratio={1} src={qrCodeSrc} alt={secret} />
                </div>
            </div>

            <div className={profileForm.formRow}>
                <p className={clsx(styles.manualDescription, profileForm.description)}>
                    <span className={styles.or}>
                        <Message {...messages.or} />
                    </span>
                    <Message {...messages.enterKeyManually} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.key} data-testid="secret">
                    {formattedSecret}
                </div>
            </div>

            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.whenKeyEntered} />
                </p>
            </div>
        </div>
    );
};

function formatSecret(secret: string): string {
    return (secret.match(/.{1,4}/g) || []).join(' ');
}

export default KeyForm;
