import React, { ComponentType, useCallback, useState } from 'react';
import clsx from 'clsx';
import ClickAwayListener from 'react-click-away-listener';

import { Account } from 'app/components/accounts';

import AccountSwitcher from './AccountSwitcher';

import styles from './loggedInPanel.scss';

interface Props {
    activeAccount: Account;
    accounts: ReadonlyArray<Account>;
    onSwitchAccount?: (account: Account) => Promise<any>;
    onRemoveAccount?: (account: Account) => Promise<any>;
}

const LoggedInPanel: ComponentType<Props> = ({ activeAccount, accounts, onSwitchAccount, onRemoveAccount }) => {
    const [isAccountSwitcherActive, setAccountSwitcherState] = useState(false);
    const hideAccountSwitcher = useCallback(() => setAccountSwitcherState(false), []);
    const onAccountClick = useCallback(
        async (account: Account) => {
            if (onSwitchAccount) {
                await onSwitchAccount(account);
            }

            setAccountSwitcherState(false);
        },
        [onSwitchAccount],
    );

    return (
        <div className={styles.loggedInPanel}>
            <div
                className={clsx(styles.activeAccount, {
                    [styles.activeAccountExpanded]: isAccountSwitcherActive,
                })}
            >
                <ClickAwayListener onClickAway={hideAccountSwitcher}>
                    <button
                        className={styles.activeAccountButton}
                        onClick={setAccountSwitcherState.bind(null, !isAccountSwitcherActive)}
                    >
                        <span className={styles.userIcon} />
                        <span className={styles.userName}>{activeAccount.username}</span>
                        <span className={styles.expandIcon} />
                    </button>

                    <div className={styles.accountSwitcherContainer}>
                        <AccountSwitcher
                            activeAccount={activeAccount}
                            accounts={accounts}
                            onAccountClick={onAccountClick}
                            onRemoveClick={onRemoveAccount}
                            onLoginClick={hideAccountSwitcher}
                        />
                    </div>
                </ClickAwayListener>
            </div>
        </div>
    );
};

export default LoggedInPanel;
