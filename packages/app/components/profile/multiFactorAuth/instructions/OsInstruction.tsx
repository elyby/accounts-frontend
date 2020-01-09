import React from 'react';
import { FormattedMessage as Message } from 'react-intl';

import messages from '../MultiFactorAuth.intl.json';
import styles from './instructions.scss';

type OS = 'android' | 'ios' | 'windows';

const linksByOs: {
  [K in OS]: {
    searchLink: string;
    featured: Array<{ link: string; label: string }>;
  };
} = {
  android: {
    searchLink: 'https://play.google.com/store/search?q=totp%20authenticator',
    featured: [
      {
        link:
          'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
        label: 'Google Authenticator',
      },
      {
        link:
          'https://play.google.com/store/apps/details?id=org.fedorahosted.freeotp',
        label: 'FreeOTP Authenticator',
      },
      {
        link:
          'https://play.google.com/store/apps/details?id=com.authenticator.authservice',
        label: 'TOTP Authenticator',
      },
    ],
  },
  ios: {
    searchLink:
      'https://linkmaker.itunes.apple.com/en-us?mediaType=ios_apps&term=authenticator',
    featured: [
      {
        link:
          'https://itunes.apple.com/ru/app/google-authenticator/id388497605',
        label: 'Google Authenticator',
      },
      {
        link:
          'https://itunes.apple.com/us/app/otp-auth-two-factor-authentication-for-pros/id659877384',
        label: 'OTP Auth',
      },
      {
        link: 'https://itunes.apple.com/us/app/2stp-authenticator/id954311670',
        label: '2STP Authenticator',
      },
    ],
  },
  windows: {
    searchLink:
      'https://www.microsoft.com/be-by/store/search/apps?devicetype=mobile&q=authenticator',
    featured: [
      {
        link:
          'https://www.microsoft.com/en-us/store/p/microsoft-authenticator/9nblgggzmcj6',
        label: 'Microsoft Authenticator',
      },
      {
        link:
          'https://www.microsoft.com/en-us/store/p/authenticator/9nblggh08h54',
        label: 'Authenticator+',
      },
      {
        link:
          'https://www.microsoft.com/en-us/store/p/authenticator-for-windows/9nblggh4n8mx',
        label: 'Authenticator for Windows',
      },
    ],
  },
};

export default function OsInstruction({ os }: { os: OS }) {
  return (
    <div
      className={styles.osInstruction}
      data-testid="os-instruction"
      data-os={os}
    >
      <h3 className={styles.instructionTitle}>
        <Message {...messages.installOnOfTheApps} />
      </h3>

      <ul className={styles.appList}>
        {linksByOs[os].featured.map(item => (
          <li key={item.label}>
            <a href={item.link} target="_blank">
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className={styles.otherApps}>
        <a href={linksByOs[os].searchLink} target="_blank">
          <Message {...messages.findAlternativeApps} />
        </a>
      </div>
    </div>
  );
}
