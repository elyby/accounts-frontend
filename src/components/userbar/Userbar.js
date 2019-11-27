// @flow
import type { Account } from 'components/accounts/reducer';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import buttons from 'components/ui/buttons.scss';

import messages from './Userbar.intl.json';
import styles from './userbar.scss';
import LoggedInPanel from './LoggedInPanel';

export default class Userbar extends Component<{
  account: ?Account,
  guestAction: 'register' | 'login',
}> {
  static displayName = 'Userbar';

  static defaultProps = {
    guestAction: 'register',
  };

  render() {
    const { account } = this.props;
    let { guestAction } = this.props;

    switch (guestAction) {
      case 'login':
        guestAction = (
          <Link to="/login" className={buttons.blue}>
            <Message {...messages.login} />
          </Link>
        );
        break;
      case 'register':
      default:
        guestAction = (
          <Link to="/register" className={buttons.blue}>
            <Message {...messages.register} />
          </Link>
        );
        break;
    }

    return (
      <div className={styles.userbar}>
        {account ? <LoggedInPanel username={account.username} /> : guestAction}
      </div>
    );
  }
}
