import React, { ComponentType, MouseEventHandler, ReactElement, useCallback } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import { useReduxDispatch, useReduxSelector } from 'app/functions';
import { authenticate, revoke } from 'app/components/accounts/actions';
import { Account } from 'app/components/accounts/reducer';
import buttons from 'app/components/ui/buttons.scss';
import LoggedInPanel from 'app/components/userbar/LoggedInPanel';
import * as loader from 'app/services/loader';

import siteName from './siteName.intl';
import styles from './root.scss';

interface Props {
    account: Account | null;
    onLogoClick?: MouseEventHandler<HTMLAnchorElement>;
}

const Toolbar: ComponentType<Props> = ({ onLogoClick, account }) => {
    const dispatch = useReduxDispatch();
    const location = useLocation();
    const availableAccounts = useReduxSelector((state) => state.accounts.available);
    const switchAccount = useCallback((account: Account) => {
        loader.show();

        return dispatch(authenticate(account)).finally(loader.hide);
    }, []);
    const removeAccount = useCallback((account: Account) => dispatch(revoke(account)), []);

    let userBar: ReactElement;

    if (account) {
        userBar = (
            <LoggedInPanel
                activeAccount={account}
                accounts={availableAccounts}
                onSwitchAccount={switchAccount}
                onRemoveAccount={removeAccount}
            />
        );
    } else if (location.pathname === '/register') {
        userBar = (
            <Link to="/login" className={buttons.blue}>
                <Message key="login" defaultMessage="Sign in" />
            </Link>
        );
    } else {
        userBar = (
            <Link to="/register" className={buttons.blue}>
                <Message key="register" defaultMessage="Join" />
            </Link>
        );
    }

    return (
        <div className={styles.toolbar} data-testid="toolbar">
            <div className={styles.toolbarContent}>
                <Link to="/" className={styles.siteName} onClick={onLogoClick} data-testid="home-page">
                    <Message {...siteName} />
                </Link>
                <div className={styles.userBar}>{userBar}</div>
            </div>
        </div>
    );
};

export default Toolbar;
