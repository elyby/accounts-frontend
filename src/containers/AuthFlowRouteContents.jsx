import { Component, PropTypes } from 'react';
import { Redirect } from 'react-router-dom';

import authFlow from 'services/authFlow';

export default class AuthFlowRouteContents extends Component {
    static propTypes = {
        component: PropTypes.any,
        routerProps: PropTypes.object
    };

    state = {
        component: null
    };

    componentDidMount() {
        this.handleProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.handleProps(nextProps);
    }

    render() {
        return this.state.component;
    }

    handleProps(props) {
        const {routerProps} = props;

        authFlow.handleRequest({
            path: routerProps.location.pathname,
            params: routerProps.match.params,
            query: routerProps.location.query
        }, this.onRedirect.bind(this), this.onRouteAllowed.bind(this, props));
    }

    onRedirect(path) {
        this.setState({
            component: <Redirect to={path} />
        });
    }

    onRouteAllowed(props) {
        const {component: Component} = props;

        this.setState({
            component: <Component {...props.routerProps} />
        });
    }
}
