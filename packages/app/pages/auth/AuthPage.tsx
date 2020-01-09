import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import AppInfo from 'app/components/auth/appInfo/AppInfo';
import PanelTransition from 'app/components/auth/PanelTransition';
import Register from 'app/components/auth/register/Register';
import Login from 'app/components/auth/login/Login';
import Permissions from 'app/components/auth/permissions/Permissions';
import ChooseAccount from 'app/components/auth/chooseAccount/ChooseAccount';
import Activation from 'app/components/auth/activation/Activation';
import ResendActivation from 'app/components/auth/resendActivation/ResendActivation';
import Password from 'app/components/auth/password/Password';
import AcceptRules from 'app/components/auth/acceptRules/AcceptRules';
import ForgotPassword from 'app/components/auth/forgotPassword/ForgotPassword';
import RecoverPassword from 'app/components/auth/recoverPassword/RecoverPassword';
import Mfa from 'app/components/auth/mfa/Mfa';
import Finish from 'app/components/auth/finish/Finish';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { RootState } from 'app/reducers';
import { Client } from 'app/components/auth/reducer';

import styles from './auth.scss';

// TODO: after migrating to new react router (posibly) this view started remounting
// after route change e.g. /login -> /password which results in state dropping
// we should find why this view is remounting or move isSidebarHidden into store
// so that it persist disregarding remounts
let isSidebarHiddenCache = false;

interface Props {
  client: Client | null;
}

class AuthPage extends React.Component<
  Props,
  {
    isSidebarHidden: boolean;
  }
> {
  state = {
    isSidebarHidden: isSidebarHiddenCache,
  };

  render() {
    const { isSidebarHidden } = this.state;
    const { client } = this.props;

    return (
      <div>
        <div
          className={isSidebarHidden ? styles.hiddenSidebar : styles.sidebar}
        >
          <AppInfo {...client} onGoToAuth={this.onGoToAuth} />
        </div>

        <div className={styles.content} data-e2e-content>
          <Switch>
            <Route path="/login" render={renderPanelTransition(Login)} />
            <Route path="/mfa" render={renderPanelTransition(Mfa)} />
            <Route path="/password" render={renderPanelTransition(Password)} />
            <Route path="/register" render={renderPanelTransition(Register)} />
            <Route
              path="/activation/:key?"
              render={renderPanelTransition(Activation)}
            />
            <Route
              path="/resend-activation"
              render={renderPanelTransition(ResendActivation)}
            />
            <Route
              path="/oauth/permissions"
              render={renderPanelTransition(Permissions)}
            />
            <Route
              path="/choose-account"
              render={renderPanelTransition(ChooseAccount)}
            />
            <Route
              path="/oauth/choose-account"
              render={renderPanelTransition(ChooseAccount)}
            />
            <Route path="/oauth/finish" component={Finish} />
            <Route
              path="/accept-rules"
              render={renderPanelTransition(AcceptRules)}
            />
            <Route
              path="/forgot-password"
              render={renderPanelTransition(ForgotPassword)}
            />
            <Route
              path="/recover-password/:key?"
              render={renderPanelTransition(RecoverPassword)}
            />
            <Redirect to="/404" />
          </Switch>
        </div>
      </div>
    );
  }

  onGoToAuth = () => {
    isSidebarHiddenCache = true;

    this.setState({
      isSidebarHidden: true,
    });
  };
}

function renderPanelTransition(factory) {
  const { Title, Body, Footer, Links } = factory();

  return props => (
    <PanelTransition
      key="panel-transition"
      Title={<Title />}
      Body={<Body {...props} />}
      Footer={<Footer />}
      Links={<Links />}
    />
  );
}

export default withRouter(
  connect((state: RootState) => ({
    client: state.auth.client,
  }))(AuthPage),
);
