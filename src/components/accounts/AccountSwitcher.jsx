import React, { Component, PropTypes } from 'react';

import styles from './accountSwitcher.scss';

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
    render() {
        return (
            <div className={styles.accountSwitcher}>
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
                            Перейти в профиль Ely.by
                        </a>
                        <a href="">
                            Выйти
                        </a>
                    </div>
                </div>
                {accounts.available.map((account) => (
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
                        <div className={styles.logoutIcon}></div>
                    </div>
                ))}
                <div>
                    <div>
                        <span>+</span>
                        Добавить аккаунт
                    </div>
                </div>
            </div>
        );
    }
}

/*
import { intlShape } from 'react-intl';

import messages from './LoggedInPanel.intl.json';


    static contextTypes = {
        intl: intlShape.isRequired
    };
                <button
                    onClick={this.onLogout}
                    className={classNames(buttons.green, buttonGroups.item)}
                    title={this.context.intl.formatMessage(messages.logout)}
                >
                    <span className={styles.logoutIcon} />
                </button>
 */
