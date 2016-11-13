import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import { skins, SKIN_DARK, COLOR_WHITE } from 'components/ui';
import { Button } from 'components/ui/form';

import styles from './accountSwitcher.scss';
import messages from './AccountSwitcher.intl.json';

export class AccountSwitcher extends Component {
    static displayName = 'AccountSwitcher';

    static propTypes = {
        switchAccount: PropTypes.func.isRequired,
        removeAccount: PropTypes.func.isRequired,
        onAfterAction: PropTypes.func, // called after each action performed
        onSwitch: PropTypes.func, // called after switching an account. The active account will be passed as arg
        accounts: PropTypes.shape({ // TODO: accounts shape
            active: PropTypes.shape({
                id: PropTypes.number
            }),
            available: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.number
            }))
        }),
        skin: PropTypes.oneOf(skins),
        highlightActiveAccount: PropTypes.bool, // whether active account should be expanded and shown on the top
        allowLogout: PropTypes.bool, // whether to show logout icon near each account
        allowAdd: PropTypes.bool // whether to show add account button
    };

    static defaultProps = {
        skin: SKIN_DARK,
        highlightActiveAccount: true,
        allowLogout: true,
        allowAdd: true,
        onAfterAction() {},
        onSwitch() {}
    };

    render() {
        const { accounts, skin, allowAdd, allowLogout, highlightActiveAccount } = this.props;

        let {available} = accounts;

        if (highlightActiveAccount) {
            available = available.filter((account) => account.id !== accounts.active.id);
        }

        return (
            <div className={classNames(
                styles.accountSwitcher,
                styles[`${skin}AccountSwitcher`],
            )}>
                {highlightActiveAccount ? (
                    <div className={styles.item}>
                        <div className={classNames(
                            styles.accountIcon,
                            styles.activeAccountIcon,
                            styles.accountIcon1
                        )} />
                        <div className={styles.activeAccountInfo}>
                            <div className={styles.activeAccountUsername}>
                                {accounts.active.username}
                            </div>
                            <div className={classNames(styles.accountEmail, styles.activeAccountEmail)}>
                                {accounts.active.email}
                            </div>
                            <div className={styles.links}>
                                <div className={styles.link}>
                                    <a href="">
                                        <Message {...messages.goToEly} />
                                    </a>
                                </div>
                                <div className={styles.link}>
                                    <a className={styles.link} onClick={this.onRemove(accounts.active)} href="#">
                                        <Message {...messages.logout} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
                {available.map((account, id) => (
                    <div className={classNames(styles.item, styles.accountSwitchItem)}
                        key={account.id}
                        onClick={this.onSwitch(account)}
                    >
                        <div className={classNames(
                            styles.accountIcon,
                            styles[`accountIcon${id % 7 + (highlightActiveAccount ? 2 : 1)}`]
                        )} />

                        {allowLogout ? (
                            <div className={styles.logoutIcon} onClick={this.onRemove(account)} />
                        ) : (
                            <div className={styles.nextIcon} />
                        )}

                        <div className={styles.accountInfo}>
                            <div className={styles.accountUsername}>
                                {account.username}
                            </div>
                            <div className={styles.accountEmail}>
                                {account.email}
                            </div>
                        </div>
                    </div>
                ))}
                {allowAdd ? (
                    <Link to="/login" onClick={this.props.onAfterAction}>
                        <Button
                            color={COLOR_WHITE}
                            block
                            small
                            className={styles.addAccount}
                            label={
                                <Message {...messages.addAccount}>
                                    {(message) =>
                                        <span>
                                            <div className={styles.addIcon} />
                                            {message}
                                        </span>
                                    }
                                </Message>
                            }
                        />
                    </Link>
                ) : null}
            </div>
        );
    }

    onSwitch = (account) => (event) => {
        event.preventDefault();

        this.props.switchAccount(account)
            .then(() => this.props.onAfterAction())
            .then(() => this.props.onSwitch(account));
    };

    onRemove = (account) => (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.removeAccount(account)
            .then(() => this.props.onAfterAction());
    };
}

import { connect } from 'react-redux';
import { authenticate, revoke } from 'components/accounts/actions';

export default connect(({accounts}) => ({
    accounts
}), {
    switchAccount: authenticate,
    removeAccount: revoke
})(AccountSwitcher);
