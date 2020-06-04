import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import icons from 'app/components/ui/icons.scss';
import { PanelBodyHeader } from 'app/components/ui/Panel';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './permissions.scss';

const scopesMessages = defineMessages({
    scope_minecraft_server_session: 'Authorization data for minecraft server',
    scope_offline_access: 'Access to your profile data, when you offline',
    scope_account_info: 'Access to your profile data (except E‑mail)',
    scope_account_email: 'Access to your E‑mail address',
});

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
                            {user.avatar ? <img src={user.avatar} /> : <span className={icons.user} />}
                        </div>
                        <div className={styles.authInfoTitle}>
                            <Message key="youAuthorizedAs" defaultMessage="You authorized as:" />
                        </div>
                        <div className={styles.authInfoEmail}>{user.username}</div>
                    </div>
                </PanelBodyHeader>
                <div className={styles.permissionsContainer}>
                    <div className={styles.permissionsTitle}>
                        <Message key="theAppNeedsAccess1" defaultMessage="This application needs access" />
                        <br />
                        <Message key="theAppNeedsAccess2" defaultMessage="to your data" />
                    </div>
                    <ul className={styles.permissionsList}>
                        {scopes.map((scope) => {
                            const key = `scope_${scope}`;
                            // @ts-ignore
                            const message = scopesMessages[key];

                            return (
                                <li key={key}>
                                    {message ? (
                                        <Message {...message} />
                                    ) : (
                                        scope.replace(/^\w|_/g, (match) => match.replace('_', ' ').toUpperCase())
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
