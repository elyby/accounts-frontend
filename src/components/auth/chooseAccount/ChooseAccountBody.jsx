import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import { AccountSwitcher } from 'components/accounts';

import styles from './chooseAccount.scss';
import messages from './ChooseAccount.intl.json';

export default class ChooseAccountBody extends BaseAuthBody {
    static displayName = 'ChooseAccountBody';
    static panelId = 'chooseAccount';

    render() {
        const {user} = this.context;
        this.context.auth.client = {name: 'foo'}; // TODO: remove me
        const {client} = this.context.auth;

        return (
            <div>
                {this.renderErrors()}

                <div>
                    <Message {...messages.description} values={{
                        appName: <span className={styles.appName}>{client.name}</span>
                    }} />
                </div>

                <div className={styles.accountSwitcherContainer}>
                    <AccountSwitcher allowAdd={false} allowLogout={false} highlightActiveAccount={false} />
                </div>
            </div>
        );
    }
}
