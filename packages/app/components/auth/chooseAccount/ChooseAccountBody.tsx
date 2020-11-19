import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { connect } from 'app/functions';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';
import { getSortedAccounts } from 'app/components/accounts/reducer';
import type { Account } from 'app/components/accounts';

import AccountSwitcher from './AccountSwitcher';
import styles from './chooseAccount.scss';

// I can't connect the ChooseAccountBody component with redux's "connect" function
// to get accounts list because it will break the TransitionMotion animation implementation.
//
// So to provide accounts list to the component, I'll create connected version of
// the composes with already provided accounts list
const ConnectedAccountSwitcher = connect((state) => ({
    accounts: getSortedAccounts(state),
}))(AccountSwitcher);

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
                        <Message
                            key="pleaseChooseAccount"
                            defaultMessage="Please select an account you're willing to use"
                        />
                    )}
                </div>

                <div className={styles.accountSwitcherContainer}>
                    <ConnectedAccountSwitcher onAccountClick={this.onSwitch} />
                </div>
            </div>
        );
    }

    onSwitch = (account: Account): Promise<void> => {
        return Promise.resolve(this.context.resolve(account));
    };
}
