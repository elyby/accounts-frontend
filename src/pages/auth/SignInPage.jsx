import React, { Component } from 'react';

import SignIn from 'components/auth/SignIn';
import AppInfo from 'components/auth/AppInfo';

import styles from './auth.scss';

export default class SignInPage extends Component {
    render() {
        var appInfo = {
            name: 'TLauncher',
            desc: `Лучший альтернативный лаунчер для Minecraft с большим количеством версий и их модификаций, а также возмоностью входа как с лицензионным аккаунтом, так и без него.`
        };

        return (
            <div>
                <div className={styles.sidebar}>
                    <AppInfo {...appInfo} />
                </div>
                <div className={styles.content}>
                    <SignIn />
                </div>
            </div>
        );
    }
}
