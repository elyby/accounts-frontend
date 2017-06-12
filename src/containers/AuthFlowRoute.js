// @flow
import React from 'react';
import { Route } from 'react-router-dom';

import AuthFlowRouteContents from './AuthFlowRouteContents';

export default function AuthFlowRoute(props: {
    component: any,
    routerProps: Object
}) {
    const {component: Component, ...routeProps} = props;

    return (
        <Route {...routeProps} render={(props) => (
            <AuthFlowRouteContents routerProps={props} component={Component} />
        )}/>
    );
}
