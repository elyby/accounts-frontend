import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import appInfo from 'app/components/auth/appInfo/AppInfo.intl.json';

import BoxesField from './BoxesField';

import styles from './styles.scss';
import messages from './BSoD.intl.json';

interface State {
    lastEventId?: string | void;
}

interface Props {
    lastEventId?: string;
}

// TODO: probably it's better to render this view from the App view
//       to remove dependencies from the store and IntlProvider
const BSoD: ComponentType<Props> = ({ lastEventId }) => {
    let emailUrl = 'mailto:support@ely.by';

    if (lastEventId) {
        emailUrl += `?subject=Bug report for #${lastEventId}`;
    }

    return (
        <div className={styles.body}>
            <canvas className={styles.canvas} ref={(el: HTMLCanvasElement | null) => el && new BoxesField(el)} />

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
                <a href={emailUrl} className={styles.support}>
                    support@ely.by
                </a>
                <div className={styles.easterEgg}>
                    <Message {...messages.alsoYouCanInteractWithBackground} />
                </div>
            </div>
        </div>
    );
};

export default BSoD;
