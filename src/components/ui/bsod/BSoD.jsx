import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import appInfo from 'components/auth/appInfo/AppInfo.intl.json';
import messages from './BSoD.intl.json';

import styles from './styles.scss';

export default function BSoD() {
    return (
        <div className={styles.body}>
            <div className={styles.wrapper}>
                <div className={styles.title}>
                    <Message {...appInfo.appName} />
                </div>
                <div className={styles.lineWithMargin}>
                    <Message {...messages.criticalErrorHappened} />
                </div>
                <div className={styles.line}>
                    <Message {...messages.reloadPageOrContactUs} />
                </div>
                <a href="mailto:support@ely.by" className={styles.support}>
                    support@ely.by
                </a>
                <div className={styles.easterEgg}>
                    <Message {...messages.alsoYouCanInteractWithBackground}/>
                </div>
            </div>
        </div>
    );
}
