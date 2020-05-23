import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

import AuthFlowRouteContents from './AuthFlowRouteContents';

export default function AuthFlowRoute(props: RouteProps) {
    const { component: Component, ...routeProps } = props;

    if (!Component) {
        throw new Error('props.component required');
    }

    return (
        <Route
            {...routeProps}
            render={(routerProps) => <AuthFlowRouteContents routerProps={routerProps} component={Component} />}
        />
    );
}
