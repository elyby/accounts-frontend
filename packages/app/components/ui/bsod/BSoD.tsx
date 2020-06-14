import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import appName from 'app/components/auth/appInfo/appName.intl';

import BoxesField from './BoxesField';

import styles from './styles.scss';

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
                    <Message {...appName} />
                </div>
                <div className={styles.lineWithMargin}>
                    <Message
                        key="criticalErrorHappened"
                        defaultMessage="There was a critical error due to which the application can not continue its normal operation."
                    />
                </div>
                <div className={styles.line}>
                    <Message
                        key="reloadPageOrContactUs"
                        defaultMessage="Please reload this page and try again. If problem occurs again, please report it to the developers by sending email to"
                    />
                </div>
                <a href={emailUrl} className={styles.support}>
                    support@ely.by
                </a>
                <div className={styles.easterEgg}>
                    <Message
                        key="alsoYouCanInteractWithBackground"
                        defaultMessage="You can also play around with the background – it's interactable ;)"
                    />
                </div>
            </div>
        </div>
    );
};

export default BSoD;
