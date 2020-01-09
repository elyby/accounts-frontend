import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input, Captcha } from 'app/components/ui/form';
import { getLogin } from 'app/components/auth/reducer';
import { PanelIcon } from 'app/components/ui/Panel';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './forgotPassword.scss';
import messages from './ForgotPassword.intl.json';

export default class ForgotPasswordBody extends BaseAuthBody {
  static displayName = 'ForgotPasswordBody';
  static panelId = 'forgotPassword';
  static hasGoBack = true;

  state = {
    isLoginEdit: false,
  };

  autoFocusField = 'login';

  render() {
    const { isLoginEdit } = this.state;

    const login = this.getLogin();
    const isLoginEditShown = isLoginEdit || !login;

    return (
      <div>
        {this.renderErrors()}

        <PanelIcon icon="lock" />

        {isLoginEditShown ? (
          <div>
            <p className={styles.descriptionText}>
              <Message {...messages.specifyEmail} />
            </p>
            <Input
              {...this.bindField('login')}
              icon="envelope"
              color="lightViolet"
              required
              placeholder={messages.accountEmail}
              defaultValue={login}
            />
          </div>
        ) : (
          <div data-testid="forgot-password-login">
            <div className={styles.login}>
              {login}
              <span
                className={styles.editLogin}
                onClick={this.onClickEdit}
                data-testid="edit-login"
              />
            </div>
            <p className={styles.descriptionText}>
              <Message {...messages.pleasePressButton} />
            </p>
          </div>
        )}

        <Captcha {...this.bindField('captcha')} delay={600} />
      </div>
    );
  }

  serialize() {
    const data = super.serialize();

    if (!data.login) {
      data.login = this.getLogin();
    }

    return data;
  }

  getLogin() {
    const login = getLogin(this.context);
    const { user } = this.context;

    return login || user.username || user.email || '';
  }

  onClickEdit = async () => {
    this.setState({
      isLoginEdit: true,
    });

    await this.context.requestRedraw();

    this.form.focus('login');
  };
}
