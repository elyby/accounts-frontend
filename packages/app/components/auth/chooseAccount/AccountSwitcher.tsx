import React, { ComponentType, MouseEventHandler, useCallback, useState } from 'react';
import clsx from 'clsx';

import { PseudoAvatar } from 'app/components/ui';
import { ComponentLoader } from 'app/components/ui/loader';
import { Account } from 'app/components/accounts/reducer';

import styles from './accountSwitcher.scss';

interface Props {
    accounts: ReadonlyArray<Account>;
    onAccountClick?: (account: Account) => Promise<void>;
}

const AccountSwitcher: ComponentType<Props> = ({ accounts, onAccountClick }) => {
    const [selectedAccount, setSelectedAccount] = useState<number>();
    const onAccountClickCallback = useCallback(
        (account: Account): MouseEventHandler => async (event) => {
            event.stopPropagation();

            setSelectedAccount(account.id);
            try {
                if (onAccountClick) {
                    await onAccountClick(account);
                }
            } finally {
                setSelectedAccount(undefined);
            }
        },
        [onAccountClick],
    );

    return (
        <div className={styles.accountSwitcher} data-testid="account-switcher">
            {accounts.map((account, index) => (
                <div
                    className={clsx(styles.item, {
                        [styles.inactiveItem]: selectedAccount && selectedAccount !== account.id,
                    })}
                    key={account.id}
                    data-e2e-account-id={account.id}
                    onClick={onAccountClickCallback(account)}
                >
                    <PseudoAvatar index={index} className={styles.accountIcon} />
                    <div className={styles.accountInfo}>
                        <div className={styles.accountUsername}>{account.username}</div>
                        <div className={styles.accountEmail}>{account.email}</div>
                    </div>
                    {selectedAccount === account.id ? (
                        <ComponentLoader skin="light" className={styles.accountLoader} />
                    ) : (
                        <div className={styles.nextIcon} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default AccountSwitcher;
