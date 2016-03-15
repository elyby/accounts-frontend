import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';

import AppInfo from 'components/auth/appInfo/AppInfo';
import PanelTransition from 'components/auth/PanelTransition';

import Finish from 'components/auth/Finish';

import styles from './auth.scss';

class AuthPage extends Component {
    static displayName = 'AuthPage';
    static propTypes = {
        client: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired
        })
    };

    state = {
        isSidebarHidden: false
    };

    render() {
        const {isSidebarHidden} = this.state;
        const {client} = this.props;

        return (
            <div>
                <div className={isSidebarHidden ? styles.hiddenSidebar : styles.sidebar}>
                    <AppInfo {...client} onGoToAuth={this.onGoToAuth} />
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
    client: state.auth.client
}))(AuthPage);
