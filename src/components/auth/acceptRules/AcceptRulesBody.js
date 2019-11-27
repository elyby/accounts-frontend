import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';

import icons from 'components/ui/icons.scss';
import BaseAuthBody from 'components/auth/BaseAuthBody';
import appInfo from 'components/auth/appInfo/AppInfo.intl.json';

import styles from './acceptRules.scss';
import messages from './AcceptRules.intl.json';

export default class AcceptRulesBody extends BaseAuthBody {
  static displayName = 'AcceptRulesBody';
  static panelId = 'acceptRules';

  render() {
    return (
      <div>
        {this.renderErrors()}

        <div className={styles.security}>
          <span className={icons.lock} />
        </div>

        <p className={styles.descriptionText}>
          <Message
            {...messages.description1}
            values={{
              link: (
                <Link to="/rules" target="_blank">
                  <Message {...messages.termsOfService} />
                </Link>
              ),
            }}
          />
          <br />
          <Message
            {...messages.description2}
            values={{
              name: <Message {...appInfo.appName} />,
            }}
          />
        </p>
      </div>
    );
  }
}
