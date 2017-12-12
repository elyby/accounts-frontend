// @flow
import React from 'react';

import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import type {User} from 'components/user';

const PrivateRoute = ({user, component: Component, ...rest}: {
    component: any,
    user: User
}) => (
    <Route {...rest} render={(props: {location: string}) => (
        user.isGuest ? (
            <Redirect to="/login" />
        ) : (
            <Component {...props}/>
        )
    )}/>
);

export default connect((state) => ({
    user: state.user
}))(PrivateRoute);
