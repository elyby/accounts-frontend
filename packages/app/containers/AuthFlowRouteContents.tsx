import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import authFlow from 'app/services/authFlow';

interface Props {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    routerProps: RouteComponentProps;
}

interface State {
    access: null | 'rejected' | 'allowed';
    component: React.ReactElement | null;
}

export default class AuthFlowRouteContents extends React.Component<Props, State> {
    state: State = {
        access: null,
        component: null,
    };

    mounted = false;

    shouldComponentUpdate({ routerProps: nextRoute, component: nextComponent }: Props, state: State) {
        const { component: prevComponent, routerProps: prevRoute } = this.props;

        return (
            prevRoute.location.pathname !== nextRoute.location.pathname ||
            prevRoute.location.search !== nextRoute.location.search ||
            prevComponent !== nextComponent ||
            this.state.access !== state.access
        );
    }

    componentDidMount() {
        this.mounted = true;
        this.handleProps(this.props);
    }

    componentDidUpdate() {
        this.handleProps(this.props);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return this.state.component;
    }

    handleProps(props: Props) {
        const { routerProps } = props;

        authFlow.handleRequest(
            {
                path: routerProps.location.pathname,
                params: routerProps.match.params,
                query: new URLSearchParams(routerProps.location.search),
            },
            this.onRedirect.bind(this),
            this.onRouteAllowed.bind(this, props),
        );
    }

    onRedirect(path: string) {
        if (!this.mounted) {
            return;
        }

        this.setState({
            access: 'rejected',
            component: <Redirect to={path} />,
        });
    }

    onRouteAllowed(props: Props) {
        if (!this.mounted) {
            return;
        }

        const { component: Component } = props;

        this.setState({
            access: 'allowed',
            component: <Component {...props.routerProps} />,
        });
    }
}
