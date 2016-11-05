import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { FormattedMessage as Message } from 'react-intl';

import { skins, SKIN_DARK } from 'components/ui';

import styles from './accountSwitcher.scss';
import messages from './AccountSwitcher.intl.json';

const accounts = {
    active: {id: 7, username: 'SleepWalker', email: 'danilenkos@auroraglobal.com'},
    available: [
        {id: 7, username: 'SleepWalker', email: 'danilenkos@auroraglobal.com'},
        {id: 8, username: 'ErickSkrauch', email: 'erick@foo.bar'},
        {id: 9, username: 'Ely-en', email: 'ely@-enfoo.bar'},
        {id: 10, username: 'Ely-by', email: 'ely-by@foo.bar'},
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
        hightLightActiveAccount: PropTypes.bool, // whether active account should be expanded and shown on the top
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
                    <div>
                        <div className="account-icon"></div>
                        <div>
                            <div>
                                {accounts.active.username}
                            </div>
                            <div>
                                {accounts.active.email}
                            </div>
                            <a href="">
                                <Message {...messages.goToEly} />
                            </a>
                            <a href="">
                                <Message {...messages.logout} />
                            </a>
                        </div>
                    </div>
                ) : null}
                {available.map((account) => (
                    <div key={account.id}>
                        <div className="account-icon"></div>
                        <div>
                            <div>
                                {account.username}
                            </div>
                            <div>
                                {account.email}
                            </div>
                        </div>
                        {allowLogout ? (
                            <div className={styles.logoutIcon}></div>
                        ) : (
                            <div className={styles.nextIcon}></div>
                        )}
                    </div>
                ))}
                {allowAdd ? (
                    <div>
                        <div>
                            <span className={styles.addAccount}>+</span>
                            <Message {...messages.addAccount} />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

