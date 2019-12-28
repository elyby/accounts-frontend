import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import icons from 'app/components/ui/icons.scss';
import { PanelBodyHeader } from 'app/components/ui/Panel';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './permissions.scss';
import messages from './Permissions.intl.json';

export default class PermissionsBody extends BaseAuthBody {
  static displayName = 'PermissionsBody';
  static panelId = 'permissions';

  render() {
    const { user } = this.context;
    const { scopes } = this.context.auth;

    return (
      <div>
        {this.renderErrors()}

        <PanelBodyHeader>
          <div className={styles.authInfo}>
            <div className={styles.authInfoAvatar}>
              {user.avatar ? (
                <img src={user.avatar} />
              ) : (
                <span className={icons.user} />
              )}
            </div>
            <div className={styles.authInfoTitle}>
              <Message {...messages.youAuthorizedAs} />
            </div>
            <div className={styles.authInfoEmail}>{user.username}</div>
          </div>
        </PanelBodyHeader>
        <div className={styles.permissionsContainer}>
          <div className={styles.permissionsTitle}>
            <Message {...messages.theAppNeedsAccess1} />
            <br />
            <Message {...messages.theAppNeedsAccess2} />
          </div>
          <ul className={styles.permissionsList}>
            {scopes.map(scope => {
              const key = `scope_${scope}`;
              const message = messages[key];

              return (
                <li key={key}>
                  {message ? (
                    <Message {...message} />
                  ) : (
                    scope.replace(/^\w|_/g, match =>
                      match.replace('_', ' ').toUpperCase(),
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}