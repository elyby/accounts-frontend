import React, { FC, useCallback, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import clsx from 'clsx';

import { useReduxSelector, useReduxDispatch } from 'app/functions';
import { resetAuth } from 'app/components/auth/actions';
import { ScrollIntoView } from 'app/components/ui/scroll';
import PrivateRoute from 'app/containers/PrivateRoute';
import AuthFlowRoute from 'app/containers/AuthFlowRoute';
import { PopupStack } from 'app/components/ui/popup';
import * as loader from 'app/services/loader';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { ComponentLoader } from 'app/components/ui/loader';
import PageNotFound from 'app/pages/404/PageNotFound';
import DeviceCode from 'app/components/auth/deviceCode';

import styles from './root.scss';
import Toolbar from './Toolbar';

const ProfileController = React.lazy(
    () => import(/* webpackChunkName: "page-profile-all" */ 'app/pages/profile/ProfileController'),
);
const RulesPage = React.lazy(() => import(/* webpackChunkName: "page-rules" */ 'app/pages/rules/RulesPage'));
const DevPage = React.lazy(() => import(/* webpackChunkName: "page-dev-applications" */ 'app/pages/dev/DevPage'));
const AuthPage = React.lazy(() => import(/* webpackChunkName: "page-auth" */ 'app/pages/auth/AuthPage'));

const RootPage: FC = () => {
    const dispatch = useReduxDispatch();
    const user = useReduxSelector((state) => state.user);
    const account = useReduxSelector(getActiveAccount);
    const isPopupActive = useReduxSelector((state) => state.popup.popups.length > 0);

    const onLogoClick = useCallback(() => {
        dispatch(resetAuth());
    }, []);

    useEffect(() => {
        loader.hide();
    }); // No deps, effect must be called on every update

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
                            <AuthFlowRoute exact path="/code" component={DeviceCode} />
                            <AuthFlowRoute path="/" component={AuthPage} />

                            <Route component={PageNotFound} />
                        </Switch>
                    </React.Suspense>
                </div>
            </div>
            <PopupStack />
        </div>
    );
};

export default RootPage;
