import React from 'react';

import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';
import { User } from 'app/components/user/reducer';

import messages from './Login.intl.json';

export default class LoginBody extends BaseAuthBody {
  static displayName = 'LoginBody';
  static panelId = 'login';
  static hasGoBack = (state: { user: User }) => {
    return !state.user.isGuest;
  };

  autoFocusField = 'login';

  render() {
    return (
      <div>
        {this.renderErrors()}

        <Input
          {...this.bindField('login')}
          icon="envelope"
          required
          placeholder={messages.emailOrUsername}
        />
      </div>
    );
  }
}
