// @flow
import React from 'react';

import classNames from 'classnames';

import { FormattedMessage as Message } from 'react-intl';

import profileForm from 'components/profile/profileForm.scss';
import messages from '../MultiFactorAuth.intl.json';

import styles from './key-form.scss';

export default function KeyForm({secret, qrCodeSrc}: {
    secret: string,
    qrCodeSrc: string
}) {
    const formattedSecret = formatSecret(secret);

    return (
        <div className={profileForm.formBody}>
            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.scanQrCode} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.qrCode}>
                    <img src={qrCodeSrc} alt={secret} />
                </div>
            </div>

            <div className={profileForm.formRow}>
                <p className={classNames(styles.manualDescription, profileForm.description)}>
                    <span className={styles.or}>
                        <Message {...messages.or} />
                    </span>
                    <Message {...messages.enterKeyManually} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.key}>
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
}

function formatSecret(secret: string): string {
    return (secret.match(/.{1,4}/g) || []).join(' ');
}
