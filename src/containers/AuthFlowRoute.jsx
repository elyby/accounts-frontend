import { PropTypes } from 'react';
import { Route } from 'react-router-dom';

import AuthFlowRouteContents from './AuthFlowRouteContents';

export default function AuthFlowRoute(props) {
    const {component: Component, ...routeProps} = props;

    return (
        <Route {...routeProps} render={(props) => (
            <AuthFlowRouteContents routerProps={props} component={Component} />
        )}/>
    );
}

AuthFlowRoute.propTypes = {
    component: PropTypes.any,
    routerProps: PropTypes.object
};
