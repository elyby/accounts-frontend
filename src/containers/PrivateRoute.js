// @flow
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { getActiveAccount } from 'components/accounts/reducer';
import type { ComponentType } from 'react';
import type { Account } from 'components/accounts';

const PrivateRoute = ({account, component: Component, ...rest}: {
    component: ComponentType<any>,
    account: ?Account
}) => (
    <Route {...rest} render={(props: {location: string}) => (
        !account || !account.token ? (
            <Redirect to="/login" />
        ) : (
            <Component {...props}/>
        )
    )}/>
);

export default connect((state): {
    account: ?Account,
} => ({
    account: getActiveAccount(state)
}))(PrivateRoute);
