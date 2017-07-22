// @flow
import React from 'react';

import classNames from 'classnames';

import { FormattedMessage as Message } from 'react-intl';

import profileForm from 'components/profile/profileForm.scss';
import messages from '../MultiFactorAuth.intl.json';

import styles from './key-form.scss';

export default function KeyForm() {
    const key = '123 123 52354 1234';

    return (
        <div className={profileForm.formBody} key="step2">
            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.scanQrCode} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.qrCode}>
                    <img src="//placekitten.com/g/242/242" alt={key} />
                </div>
            </div>

            <div className={profileForm.formRow}>
                <p className={classNames(styles.manualDescription, profileForm.description)}>
                    <div className={styles.or}>
                        <Message {...messages.or} />
                    </div>
                    <Message {...messages.enterKeyManually} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.key}>
                    {key}
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
