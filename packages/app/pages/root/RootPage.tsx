import React from 'react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import { Route, Link, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import clsx from 'clsx';

import { connect } from 'app/functions';
import { resetAuth } from 'app/components/auth/actions';
import { ScrollIntoView } from 'app/components/ui/scroll';
import PrivateRoute from 'app/containers/PrivateRoute';
import AuthFlowRoute from 'app/containers/AuthFlowRoute';
import Userbar from 'app/components/userbar/Userbar';
import { PopupStack } from 'app/components/ui/popup';
import * as loader from 'app/services/loader';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { User } from 'app/components/user';
import { Account } from 'app/components/accounts/reducer';
import { ComponentLoader } from 'app/components/ui/loader';

import styles from './root.scss';
import siteName from './siteName.intl';

import PageNotFound from 'app/pages/404/PageNotFound';

const ProfileController = React.lazy(() =>
    import(/* webpackChunkName: "page-profile-all" */ 'app/pages/profile/ProfileController'),
);
const RulesPage = React.lazy(() => import(/* webpackChunkName: "page-rules" */ 'app/pages/rules/RulesPage'));
const DevPage = React.lazy(() => import(/* webpackChunkName: "page-dev-applications" */ 'app/pages/dev/DevPage'));
const AuthPage = React.lazy(() => import(/* webpackChunkName: "page-auth" */ 'app/pages/auth/AuthPage'));

class RootPage extends React.PureComponent<{
    account: Account | null;
    user: User;
    isPopupActive: boolean;
    onLogoClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    location: {
        pathname: string;
    };
}> {
    componentDidMount() {
        this.onPageUpdate();
    }

    componentDidUpdate() {
        this.onPageUpdate();
    }

    onPageUpdate() {
        loader.hide();
    }

    render() {
        const { props } = this;
        const { user, account, isPopupActive, onLogoClick } = this.props;
        const isRegisterPage = props.location.pathname === '/register';

        if (document && document.body) {
            document.body.style.overflow = isPopupActive ? 'hidden' : '';
        }

        return (
            <div className={styles.root}>
                <Helmet>
                    <html lang={user.lang} />
                </Helmet>

                <ScrollIntoView top />

                <div
                    id="view-port"
                    className={clsx(styles.viewPort, {
                        [styles.isPopupActive]: isPopupActive,
                    })}
                >
                    <div className={styles.header} data-testid="toolbar">
                        <div className={styles.headerContent}>
                            <Link to="/" className={styles.logo} onClick={onLogoClick} data-testid="home-page">
                                <Message {...siteName} />
                            </Link>
                            <div className={styles.userbar}>
                                <Userbar account={account} guestAction={isRegisterPage ? 'login' : 'register'} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.body}>
                        <React.Suspense fallback={<ComponentLoader />}>
                            <Switch>
                                <PrivateRoute path="/profile" component={ProfileController} />
                                <Route path="/404" component={PageNotFound} />
                                <Route path="/rules" component={RulesPage} />
                                <Route path="/dev" component={DevPage} />

                                <AuthFlowRoute
                                    exact
                                    path="/"
                                    key="indexPage"
                                    component={user.isGuest ? AuthPage : ProfileController}
                                />
                                <AuthFlowRoute path="/" component={AuthPage} />

                                <Route component={PageNotFound} />
                            </Switch>
                        </React.Suspense>
                    </div>
                </div>
                <PopupStack />
            </div>
        );
    }
}

export default withRouter(
    connect(
        (state) => ({
            user: state.user,
            account: getActiveAccount(state),
            isPopupActive: state.popup.popups.length > 0,
        }),
        {
            onLogoClick: resetAuth,
        },
    )(RootPage),
);
