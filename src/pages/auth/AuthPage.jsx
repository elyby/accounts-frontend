import React, { Component } from 'react';
import { connect } from 'react-redux';

import AppInfo from 'components/auth/AppInfo';
import PanelTransition from 'components/auth/PanelTransition';

import styles from './auth.scss';

class AuthPage extends Component {
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
                    <PanelTransition {...this.props} />
                </div>
            </div>
        );
    }
}

export default connect((state) => ({
    path: state.routing.location.pathname
}))(AuthPage);
