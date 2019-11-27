// @flow
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { PanelIcon } from 'components/ui/Panel';
import { Input } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';

import styles from './mfa.scss';
import messages from './Mfa.intl.json';

export default class MfaBody extends BaseAuthBody {
  static panelId = 'mfa';
  static hasGoBack = true;

  autoFocusField = 'totp';

  render() {
    return (
      <div>
        {this.renderErrors()}

        <PanelIcon icon="lock" />

        <p className={styles.descriptionText}>
          <Message {...messages.description} />
        </p>

        <Input
          {...this.bindField('totp')}
          icon="key"
          required
          placeholder={messages.enterTotp}
          autoComplete="off"
        />
      </div>
    );
  }
}
