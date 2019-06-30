// @flow
import type { ComponentType, ElementConfig } from 'react';
import type { Account } from 'components/accounts';
import type { Location } from 'react-router-dom';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { getActiveAccount } from 'components/accounts/reducer';

type OwnProps = {|
    ...$Exact<ElementConfig<typeof Route>>,
    component: ComponentType<any>,
|};

type Props = {
    ...OwnProps,
    account: ?Account
};

const PrivateRoute = ({ account, component: Component, ...rest }: Props) => (
    <Route
        {...rest}
        render={(props: { location: Location }) =>
            !account || !account.token ? (
                <Redirect to="/login" />
            ) : (
                <Component {...props} />
            )
        }
    />
);

export default connect<Props, OwnProps, _, _, _, _>((state) => ({
    account: getActiveAccount(state)
}))(PrivateRoute);
