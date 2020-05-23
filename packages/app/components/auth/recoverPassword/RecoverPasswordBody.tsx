import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './recoverPassword.scss';
import messages from './RecoverPassword.intl.json';

// TODO: activation code field may be decoupled into common component and reused here and in activation panel

export default class RecoverPasswordBody extends BaseAuthBody {
  static displayName = 'RecoverPasswordBody';
  static panelId = 'recoverPassword';
  static hasGoBack = true;

  autoFocusField =
    this.props.match.params && this.props.match.params.key
      ? 'newPassword'
      : 'key';

  render() {
    const { user } = this.context;
    const { key } = this.props.match.params;

    return (
      <div>
        {this.renderErrors()}

        <p className={styles.descriptionText}>
          {user.maskedEmail ? (
            <Message
              {...messages.messageWasSentTo}
              values={{
                email: <b>{user.maskedEmail}</b>,
              }}
            />
          ) : (
            <Message {...messages.messageWasSent} />
          )}{' '}
          <Message {...messages.enterCodeBelow} />
        </p>

        <Input
          {...this.bindField('key')}
          color="lightViolet"
          center
          required
          value={key}
          readOnly={!!key}
          autoComplete="off"
          placeholder={messages.enterTheCode}
        />

        <p className={styles.descriptionText}>
          <Message {...messages.enterNewPasswordBelow} />
        </p>

        <Input
          {...this.bindField('newPassword')}
          icon="key"
          color="lightViolet"
          type="password"
          required
          placeholder={messages.newPassword}
        />

        <Input
          {...this.bindField('newRePassword')}
          icon="key"
          color="lightViolet"
          type="password"
          required
          placeholder={messages.newRePassword}
        />
      </div>
    );
  }
}
