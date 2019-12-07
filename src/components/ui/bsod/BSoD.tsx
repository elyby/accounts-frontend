import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { IntlProvider } from 'components/i18n';
import logger from 'services/logger';
import appInfo from 'components/auth/appInfo/AppInfo.intl.json';

import styles from './styles.scss';
import BoxesField from './BoxesField';
import messages from './BSoD.intl.json';

interface State {
  lastEventId?: string | void;
}

// TODO: probably it is better to render this view from the App view
// to remove dependencies from store and IntlProvider
class BSoD extends React.Component<{}, State> {
  state: State = {};

  componentDidMount() {
    // poll for event id
    const timer = setInterval(() => {
      if (!logger.getLastEventId()) {
        return;
      }

      clearInterval(timer);

      this.setState({
        lastEventId: logger.getLastEventId(),
      });
    }, 500);
  }

  render() {
    const { lastEventId } = this.state;

    let emailUrl = 'mailto:support@ely.by';

    if (lastEventId) {
      emailUrl += `?subject=Bug report for #${lastEventId}`;
    }

    return (
      <IntlProvider>
        <div className={styles.body}>
          <canvas
            className={styles.canvas}
            ref={(el: HTMLCanvasElement | null) => el && new BoxesField(el)}
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
            <a href={emailUrl} className={styles.support}>
              support@ely.by
            </a>
            <div className={styles.easterEgg}>
              <Message {...messages.alsoYouCanInteractWithBackground} />
            </div>
          </div>
        </div>
      </IntlProvider>
    );
  }
}

export default BSoD;
