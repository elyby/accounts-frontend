import React, { ComponentType } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { Location } from 'history';
import { connect } from 'react-redux';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { Account } from 'app/components/accounts';
import { RootState } from 'app/reducers';

interface Props extends RouteProps {
    component: ComponentType<any>;
    account: Account | null;
}

const PrivateRoute = ({ account, component: Component, ...rest }: Props) => (
    <Route
        {...rest}
        render={(props: { location: Location }) =>
            !account || !account.token ? <Redirect to="/login" /> : <Component {...props} />
        }
    />
);

export default connect((state: RootState) => ({
    account: getActiveAccount(state),
}))(PrivateRoute);
