import React, { FC, ComponentType } from 'react';
import { Route, RouteProps, RouteComponentProps } from 'react-router-dom';

import AuthFlowRouteContents from './AuthFlowRouteContents';

// Make "component" prop required
type Props = Omit<RouteProps, 'component'> & {
    component: ComponentType<RouteComponentProps>;
};

const AuthFlowRoute: FC<Props> = ({ component: Component, ...props }) => {
    return (
        <Route {...props} render={(routerProps) => <AuthFlowRouteContents component={Component} {...routerProps} />} />
    );
};

export default AuthFlowRoute;
