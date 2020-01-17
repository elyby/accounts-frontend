import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import * as loader from 'app/services/loader';
import { SKIN_DARK, COLOR_WHITE, Skin } from 'app/components/ui';
import { Button } from 'app/components/ui/form';
import { authenticate, revoke } from 'app/components/accounts/actions';
import { getActiveAccount, Account } from 'app/components/accounts/reducer';
import { RootState } from 'app/reducers';

import styles from './accountSwitcher.scss';
import messages from './AccountSwitcher.intl.json';

interface Props {
  switchAccount: (account: Account) => Promise<Account>;
  removeAccount: (account: Account) => Promise<void>;
  // called after each action performed
  onAfterAction: () => void;
  // called after switching an account. The active account will be passed as arg
  onSwitch: (account: Account) => void;
  accounts: RootState['accounts'];
  skin: Skin;
  // whether active account should be expanded and shown on the top
  highlightActiveAccount: boolean;
  // whether to show logout icon near each account
  allowLogout: boolean;
  // whether to show add account button
  allowAdd: boolean;
}

export class AccountSwitcher extends React.Component<Props> {
  static defaultProps: Partial<Props> = {
    skin: SKIN_DARK,
    highlightActiveAccount: true,
    allowLogout: true,
    allowAdd: true,
    onAfterAction() {},
    onSwitch() {},
  };

  render() {
    const {
      accounts,
      skin,
      allowAdd,
      allowLogout,
      highlightActiveAccount,
    } = this.props;
    const activeAccount = getActiveAccount({ accounts });

    if (!activeAccount) {
      return null;
    }

    let { available } = accounts;

    if (highlightActiveAccount) {
      available = available.filter(account => account.id !== activeAccount.id);
    }

    return (
      <div
        className={clsx(
          styles.accountSwitcher,
          styles[`${skin}AccountSwitcher`],
        )}
        data-testid="account-switcher"
      >
        {highlightActiveAccount && (
          <div className={styles.item} data-testid="active-account">
            <div
              className={clsx(
                styles.accountIcon,
                styles.activeAccountIcon,
                styles.accountIcon1,
              )}
            />
            <div className={styles.activeAccountInfo}>
              <div className={styles.activeAccountUsername}>
                {activeAccount.username}
              </div>
              <div
                className={clsx(styles.accountEmail, styles.activeAccountEmail)}
              >
                {activeAccount.email}
              </div>
              <div className={styles.links}>
                <div className={styles.link}>
                  <a
                    href={`http://ely.by/u${activeAccount.id}`}
                    target="_blank"
                  >
                    <Message {...messages.goToEly} />
                  </a>
                </div>
                <div className={styles.link}>
                  <a
                    className={styles.link}
                    data-testid="logout-account"
                    onClick={this.onRemove(activeAccount)}
                    href="#"
                  >
                    <Message {...messages.logout} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {available.map((account, index) => (
          <div
            className={clsx(styles.item, styles.accountSwitchItem)}
            key={account.id}
            data-e2e-account-id={account.id}
            onClick={this.onSwitch(account)}
          >
            <div
              className={clsx(
                styles.accountIcon,
                styles[
                  `accountIcon${(index % 7) + (highlightActiveAccount ? 2 : 1)}`
                ],
              )}
            />

            {allowLogout ? (
              <div
                className={styles.logoutIcon}
                data-testid="logout-account"
                onClick={this.onRemove(account)}
              />
            ) : (
              <div className={styles.nextIcon} />
            )}

            <div className={styles.accountInfo}>
              <div className={styles.accountUsername}>{account.username}</div>
              <div className={styles.accountEmail}>{account.email}</div>
            </div>
          </div>
        ))}
        {allowAdd ? (
          <Link to="/login" onClick={this.props.onAfterAction}>
            <Button
              color={COLOR_WHITE}
              data-testid="add-account"
              block
              small
              className={styles.addAccount}
              label={
                <Message {...messages.addAccount}>
                  {message => (
                    <span>
                      <div className={styles.addIcon} />
                      {message}
                    </span>
                  )}
                </Message>
              }
            />
          </Link>
        ) : null}
      </div>
    );
  }

  onSwitch = (account: Account) => (event: React.MouseEvent) => {
    event.preventDefault();

    loader.show();

    this.props
      .switchAccount(account)
      .finally(() => this.props.onAfterAction())
      .then(() => this.props.onSwitch(account))
      // we won't sent any logs to sentry, because an error should be already
      // handled by external logic
      .catch(error => console.warn('Error switching account', { error }))
      .finally(() => loader.hide());
  };

  onRemove = (account: Account) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.removeAccount(account).then(() => this.props.onAfterAction());
  };
}

export default connect(
  ({ accounts }: RootState) => ({
    accounts,
  }),
  {
    switchAccount: authenticate,
    removeAccount: revoke,
  },
)(AccountSwitcher);
