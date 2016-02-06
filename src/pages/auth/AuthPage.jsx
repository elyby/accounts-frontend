import React, { Component } from 'react';
import { connect } from 'react-redux';

import AppInfo from 'components/auth/AppInfo';
import PanelTransition from 'components/auth/PanelTransition';

import styles from './auth.scss';

class AuthPage extends Component {
    static displayName = 'AuthPage';

    state = {
        isSidebarHidden: false
    };

    render() {
        var {isSidebarHidden} = this.state;

        var appInfo = {
            name: 'TLauncher',
            description: `Лучший альтернативный лаунчер для Minecraft с большим количеством версий и их модификаций, а также возмоностью входа как с лицензионным аккаунтом, так и без него.`
        };

        return (
            <div>
                <div className={isSidebarHidden ? styles.hiddenSidebar : styles.sidebar}>
                    <AppInfo {...appInfo} onGoToAuth={this.onGoToAuth} />
                </div>
                <div className={styles.content}>
                    <PanelTransition {...this.props} />
                </div>
            </div>
        );
    }

    onGoToAuth = () => {
        this.setState({
            isSidebarHidden: true
        });
    };
}

export default connect((state) => ({
    path: state.routing.location.pathname
}))(AuthPage);
