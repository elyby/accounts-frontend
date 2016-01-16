import React, { Component } from 'react';

import AppInfo from 'components/auth/AppInfo';

import styles from './auth.scss';

export default class AuthPage extends Component {
    displayName = 'AuthPage';

    render() {
        var appInfo = {
            name: 'TLauncher',
            description: `Лучший альтернативный лаунчер для Minecraft с большим количеством версий и их модификаций, а также возмоностью входа как с лицензионным аккаунтом, так и без него.`
        };

        return (
            <div>
                <div className={styles.sidebar}>
                    <AppInfo {...appInfo} />
                </div>
                <div className={styles.content}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
