import React, { ComponentType, MouseEventHandler, useCallback } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import { PseudoAvatar } from 'app/components/ui';
import { Button } from 'app/components/ui/form';
import { Account } from 'app/components/accounts/reducer';
import messages from 'app/components/accounts/accountSwitcher.intl';

import styles from './accountSwitcher.scss';

interface Props {
    activeAccount: Account;
    accounts: ReadonlyArray<Account>;
    onAccountClick?: (account: Account) => void;
    onRemoveClick?: (account: Account) => void;
    onLoginClick?: MouseEventHandler<HTMLAnchorElement>;
}

const AccountSwitcher: ComponentType<Props> = ({
    activeAccount,
    accounts,
    onAccountClick = () => {},
    onRemoveClick = () => {},
    onLoginClick,
}) => {
    const available = accounts.filter((account) => account.id !== activeAccount.id);
    const onAccountClickCallback = useCallback(
        (account: Account): MouseEventHandler =>
            (event) => {
                event.preventDefault();
                onAccountClick(account);
            },
        [onAccountClick],
    );
    const onAccountRemoveCallback = useCallback(
        (account: Account): MouseEventHandler =>
            (event) => {
                event.preventDefault();
                event.stopPropagation();

                onRemoveClick(account);
            },
        [onRemoveClick],
    );

    return (
        <div className={clsx(styles.accountSwitcher)} data-testid="account-switcher">
            <div className={styles.item} data-testid="active-account">
                <PseudoAvatar className={styles.activeAccountIcon} />
                <div>
                    <div className={styles.activeAccountUsername}>{activeAccount.username}</div>
                    <div className={clsx(styles.accountEmail, styles.activeAccountEmail)}>{activeAccount.email}</div>
                    <div className={styles.links}>
                        <div className={styles.link}>
                            <a href={`//ely.by/u${activeAccount.id}`} target="_blank">
                                <Message {...messages.goToEly} />
                            </a>
                        </div>
                        <div className={styles.link}>
                            <a
                                className={styles.link}
                                data-testid="logout-account"
                                onClick={onAccountRemoveCallback(activeAccount)}
                                href="#"
                            >
                                <Message {...messages.logout} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {available.map((account, index) => (
                <div
                    className={clsx(styles.item, styles.accountSwitchItem, {
                        [styles.deletedAccountItem]: account.isDeleted,
                    })}
                    key={account.id}
                    data-e2e-account-id={account.id}
                    onClick={onAccountClickCallback(account)}
                >
                    <PseudoAvatar index={index + 1} deleted={account.isDeleted} className={styles.accountIcon} />

                    <div className={styles.accountInfo}>
                        <div className={styles.accountUsername}>{account.username}</div>
                        <div className={styles.accountEmail}>{account.email}</div>
                    </div>

                    <div
                        className={styles.logoutIcon}
                        data-testid="logout-account"
                        onClick={onAccountRemoveCallback(account)}
                    />
                </div>
            ))}
            <Link to="/login" onClick={onLoginClick}>
                <Button color="white" data-testid="add-account" block small>
                    <span>
                        <div className={styles.addIcon} />
                        <Message {...messages.addAccount} />
                    </span>
                </Button>
            </Link>
        </div>
    );
};

export default AccountSwitcher;
