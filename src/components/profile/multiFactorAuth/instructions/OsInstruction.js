// @flow
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import messages from '../MultiFactorAuth.intl.json';
import styles from './instructions.scss';

type OS = 'android'|'ios'|'windows';

const linksByOs: {[key: OS]: Array<{link: string, label: string}>} = {
    android: [
        {
            link: '',
            label: 'Google Authenticator'
        },
        {
            link: '',
            label: 'FreeOTP Authenticator'
        },
        {
            link: '',
            label: 'TOTP Authenticator'
        }
    ],
    ios: [
    ],
    windows: [
    ]
};

export default function OsInstruction({
    os
}: {
    os: OS
}) {
    return (
        <div className={styles.osInstruction}>
            <h3 className={styles.instructionTitle}>
                <Message {...messages.installOnOfTheApps} />
            </h3>

            <ul className={styles.appList}>
                {linksByOs[os].map((item) => (
                    <li key={item.label}>
                        <a href={item.link}>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>

            <div className={styles.otherApps}>
                <a href="">
                    <Message {...messages.getAlternativeApps} />
                </a>
            </div>
        </div>
    );
}
