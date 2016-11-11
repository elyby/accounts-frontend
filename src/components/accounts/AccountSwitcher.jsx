import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import { skins, SKIN_DARK, COLOR_WHITE } from 'components/ui';
import { Button } from 'components/ui/form';

import styles from './accountSwitcher.scss';
import messages from './AccountSwitcher.intl.json';

const accounts = {
    active: {id: 7, username: 'SleepWalker', email: 'danilenkos@auroraglobal.com'},
    available: [
        {id: 7, username: 'SleepWalker', email: 'danilenkos@auroraglobal.com'},
        {id: 8, username: 'ErickSkrauch', email: 'erickskrauch@yandex.ru'},
        {id: 9, username: 'Ely-en', email: 'ely-en@ely.by'},
        {id: 10, username: 'Ely-by', email: 'ely-pt@ely.by'},
    ]
};

export default class AccountSwitcher extends Component {
    static displayName = 'AccountSwitcher';

    static propTypes = {
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
        accounts
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
                        )}></div>
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
                                    <a href="" className={styles.link}>
                                        <Message {...messages.logout} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
                {available.map((account, id) => (
                    <div className={classNames(styles.item, styles.accountSwitchItem)} key={account.id}>
                        <div className={classNames(
                            styles.accountIcon,
                            styles[`accountIcon${id % 7 + (highlightActiveAccount ? 2 : 1)}`]
                        )}></div>

                        {allowLogout ? (
                            <div className={styles.logoutIcon}></div>
                        ) : (
                            <div className={styles.nextIcon}></div>
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
                    <Link to="/login">
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
}

