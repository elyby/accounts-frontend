import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Route, Link, Switch } from 'react-router-dom';
import Helmet from 'react-helmet';
import classNames from 'classnames';

import AuthPage from 'pages/auth/AuthPage';
import ProfilePage from 'pages/profile/ProfilePage';
import RulesPage from 'pages/rules/RulesPage';
import PageNotFound from 'pages/404/PageNotFound';

// @flow
import { restoreScroll } from 'functions';
import PrivateRoute from 'containers/PrivateRoute';
import AuthFlowRoute from 'containers/AuthFlowRoute';
import Userbar from 'components/userbar/Userbar';
import PopupStack from 'components/ui/popup/PopupStack';
import loader from 'services/loader';
import type { User } from 'components/user';

import styles from './root.scss';
import messages from './RootPage.intl.json';

/* global process: false */
let DevTools;
if (process.env.NODE_ENV === 'production') {
    DevTools = () => null;
} else {
    DevTools = require('containers/DevTools').default;
}

class RootPage extends Component {
    props: {
        user: User,
        isPopupActive: boolean,
        onLogoClick: Function,
        location: {
            pathname: string
        }
    };

    componentDidMount() {
        this.onPageUpdate();
    }

    componentDidUpdate() {
        this.onPageUpdate();
    }

    onPageUpdate() {
        loader.hide();
        restoreScroll();
    }

    render() {
        const props = this.props;
        const {user} = this.props;
        const isRegisterPage = props.location.pathname === '/register';

        if (document && document.body) {
            document.body.style.overflow = props.isPopupActive ? 'hidden' : '';
        }

        return (
            <div className={styles.root}>
                <Helmet>
                    <html lang={user.lang} />
                </Helmet>
                <div id="view-port" className={classNames(styles.viewPort, {
                    [styles.isPopupActive]: props.isPopupActive
                })}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <Link to="/" className={styles.logo} onClick={props.onLogoClick}>
                                <Message {...messages.siteName} />
                            </Link>
                            <div className={styles.userbar}>
                                <Userbar {...props}
                                    guestAction={isRegisterPage ? 'login' : 'register'}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.body}>
                        <Switch>
                            <PrivateRoute path="/profile" component={ProfilePage} />
                            <Route path="/404" component={PageNotFound} />
                            <Route path="/rules" component={RulesPage} />
                            <AuthFlowRoute exact path="/" component={ProfilePage} />
                            <AuthFlowRoute path="/" component={AuthPage} />
                            <Route component={PageNotFound} />
                        </Switch>
                    </div>
                </div>
                <PopupStack />
                <DevTools />
            </div>
        );
    }
}

import { connect } from 'react-redux';
import { resetAuth } from 'components/auth/actions';
import { withRouter } from 'react-router';

export default withRouter(connect((state) => ({
    user: state.user,
    isPopupActive: state.popup.popups.length > 0
}), {
    onLogoClick: resetAuth
})(RootPage));
