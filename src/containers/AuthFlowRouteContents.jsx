// @flow
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import authFlow from 'services/authFlow';

type ComponentProps = {
    component: any,
    routerProps: Object
};

export default class AuthFlowRouteContents extends Component {
    props: ComponentProps;

    state: {
        component: any
    } = {
        component: null
    };

    componentDidMount() {
        this.handleProps(this.props);
    }

    componentWillReceiveProps(nextProps: ComponentProps) {
        this.handleProps(nextProps);
    }

    render() {
        return this.state.component;
    }

    handleProps(props: ComponentProps) {
        const {routerProps} = props;

        authFlow.handleRequest({
            path: routerProps.location.pathname,
            params: routerProps.match.params,
            query: routerProps.location.query
        }, this.onRedirect.bind(this), this.onRouteAllowed.bind(this, props));
    }

    onRedirect(path: string) {
        this.setState({
            component: <Redirect to={path} />
        });
    }

    onRouteAllowed(props: ComponentProps) {
        const {component: Component} = props;

        this.setState({
            component: <Component {...props.routerProps} />
        });
    }
}
