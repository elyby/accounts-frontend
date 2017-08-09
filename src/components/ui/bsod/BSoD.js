// @flow
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { IntlProvider } from 'components/i18n';
import appInfo from 'components/auth/appInfo/AppInfo.intl.json';

import styles from './styles.scss';
import BoxesField from './BoxesField';
import messages from './BSoD.intl.json';

// TODO: probably it is better to render this view from the App view
// to remove dependencies from store and IntlProvider
export default function BSoD({store}: {store: *}) {
    return (
        <IntlProvider store={store}>
            <div className={styles.body}>
                <canvas className={styles.canvas}
                    ref={(el: ?HTMLCanvasElement) => new BoxesField(el)}
                />

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
        </IntlProvider>
    );
}
