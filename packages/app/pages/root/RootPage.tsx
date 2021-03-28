import React from 'react';
import { Route, Switch } from 'react-router-dom';
import clsx from 'clsx';

import { connect } from 'app/functions';
import { resetAuth } from 'app/components/auth/actions';
import { ScrollIntoView } from 'app/components/ui/scroll';
import PrivateRoute from 'app/containers/PrivateRoute';
import AuthFlowRoute from 'app/containers/AuthFlowRoute';
import { PopupStack } from 'app/components/ui/popup';
import * as loader from 'app/services/loader';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { User } from 'app/components/user';
import { Account } from 'app/components/accounts/reducer';
import { ComponentLoader } from 'app/components/ui/loader';
import Toolbar from './Toolbar';

import styles from './root.scss';

import PageNotFound from 'app/pages/404/PageNotFound';

const ProfileController = React.lazy(
    () => import(/* webpackChunkName: "page-profile-all" */ 'app/pages/profile/ProfileController'),
);
const RulesPage = React.lazy(() => import(/* webpackChunkName: "page-rules" */ 'app/pages/rules/RulesPage'));
const DevPage = React.lazy(() => import(/* webpackChunkName: "page-dev-applications" */ 'app/pages/dev/DevPage'));
const AuthPage = React.lazy(() => import(/* webpackChunkName: "page-auth" */ 'app/pages/auth/AuthPage'));

class RootPage extends React.PureComponent<{
    account: Account | null;
    user: User;
    isPopupActive: boolean;
    onLogoClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
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
        const { user, account, isPopupActive, onLogoClick } = this.props;

        if (document && document.body) {
            document.body.style.overflow = isPopupActive ? 'hidden' : '';
        }

        return (
            <div className={styles.root}>
                <ScrollIntoView top />

                <div
                    id="view-port"
                    className={clsx(styles.viewPort, {
                        [styles.isPopupActive]: isPopupActive,
                    })}
                >
                    <Toolbar account={account} onLogoClick={onLogoClick} />
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

export default connect(
    (state) => ({
        user: state.user,
        account: getActiveAccount(state),
        isPopupActive: state.popup.popups.length > 0,
    }),
    {
        onLogoClick: resetAuth,
    },
)(RootPage);
