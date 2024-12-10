import React, { FC } from 'react';
import { Route, RouteProps } from 'react-router-dom';

import AuthFlowRouteContents from './AuthFlowRouteContents';

// Make "component" prop required
type Props = Omit<RouteProps, 'component'> & Required<Pick<RouteProps, 'component'>>;

const AuthFlowRoute: FC<Props> = ({ component: Component, ...props }) => {
    return (
        <Route
            {...props}
            render={(routerProps) => <AuthFlowRouteContents routerProps={routerProps} component={Component} />}
        />
    );
};

export default AuthFlowRoute;
