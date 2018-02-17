// @flow
import React, { Component } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import AppInfo from 'components/auth/appInfo/AppInfo';
import PanelTransition from 'components/auth/PanelTransition';

import Register from 'components/auth/register/Register';
import Login from 'components/auth/login/Login';
import Permissions from 'components/auth/permissions/Permissions';
import ChooseAccount from 'components/auth/chooseAccount/ChooseAccount';
import Activation from 'components/auth/activation/Activation';
import ResendActivation from 'components/auth/resendActivation/ResendActivation';
import Password from 'components/auth/password/Password';
import AcceptRules from 'components/auth/acceptRules/AcceptRules';
import ForgotPassword from 'components/auth/forgotPassword/ForgotPassword';
import RecoverPassword from 'components/auth/recoverPassword/RecoverPassword';
import Mfa from 'components/auth/mfa/Mfa';
import Finish from 'components/auth/finish/Finish';

import styles from './auth.scss';

// TODO: after migrating to new react router (posibly) this view started remounting
// after route change e.g. /login -> /password which results in state dropping
// we should find why this view is remounting or move isSidebarHidden into store
// so that it persist disregarding remounts
let isSidebarHiddenCache = false;

class AuthPage extends Component<{
    client: {
        id: string,
        name: string,
        description: string
    }
}, {
    isSidebarHidden: bool
}> {
    state = {
        isSidebarHidden: isSidebarHiddenCache
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
                    <Switch>
                        <Route path="/login" render={renderPanelTransition(Login)} />
                        <Route path="/mfa" render={renderPanelTransition(Mfa)} />
                        <Route path="/password" render={renderPanelTransition(Password)} />
                        <Route path="/register" render={renderPanelTransition(Register)} />
                        <Route path="/activation/:key?" render={renderPanelTransition(Activation)} />
                        <Route path="/resend-activation" render={renderPanelTransition(ResendActivation)} />
                        <Route path="/oauth/permissions" render={renderPanelTransition(Permissions)} />
                        <Route path="/choose-account" render={renderPanelTransition(ChooseAccount)} />
                        <Route path="/oauth/choose-account" render={renderPanelTransition(ChooseAccount)} />
                        <Route path="/oauth/finish" component={Finish} />
                        <Route path="/accept-rules" render={renderPanelTransition(AcceptRules)} />
                        <Route path="/forgot-password" render={renderPanelTransition(ForgotPassword)} />
                        <Route path="/recover-password/:key?" render={renderPanelTransition(RecoverPassword)} />
                        <Redirect to="/404" />
                    </Switch>
                </div>
            </div>
        );
    }

    onGoToAuth = () => {
        isSidebarHiddenCache = true;

        this.setState({
            isSidebarHidden: true
        });
    };
}

function renderPanelTransition(factory) {
    const {Title, Body, Footer, Links} = factory();

    return (props) => (
        <PanelTransition
            key="panel-transition"
            Title={<Title />}
            Body={<Body {...props} />}
            Footer={<Footer />}
            Links={<Links />}
            {...props}
        />
    );
}

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

export default withRouter(connect((state) => ({
    client: state.auth.client
}))(AuthPage));
