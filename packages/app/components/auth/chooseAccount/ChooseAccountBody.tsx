import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import BaseAuthBody from 'app/components/auth/BaseAuthBody';
import { AccountSwitcher } from 'app/components/accounts';
import { Account } from 'app/components/accounts/reducer';

import styles from './chooseAccount.scss';

export default class ChooseAccountBody extends BaseAuthBody {
    static displayName = 'ChooseAccountBody';
    static panelId = 'chooseAccount';

    render() {
        const { client } = this.context.auth;

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.description}>
                    {client ? (
                        <Message
                            key="pleaseChooseAccountForApp"
                            defaultMessage="Please select an account that you want to use to authorize {appName}"
                            values={{
                                appName: <span className={styles.appName}>{client.name}</span>,
                            }}
                        />
                    ) : (
                        <div className={styles.description}>
                            <Message
                                key="pleaseChooseAccount"
                                defaultMessage="Please select an account you're willing to use"
                            />
                        </div>
                    )}
                </div>

                <div className={styles.accountSwitcherContainer}>
                    <AccountSwitcher
                        allowAdd={false}
                        allowLogout={false}
                        highlightActiveAccount={false}
                        onSwitch={this.onSwitch}
                    />
                </div>
            </div>
        );
    }

    onSwitch = (account: Account): void => {
        this.context.resolve(account);
    };
}
