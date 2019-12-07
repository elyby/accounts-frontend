import React from 'react';
import { Redirect } from 'react-router-dom';

import authFlow from 'app/services/authFlow';

type ComponentProps = {
  component: any;
  routerProps: { [key: string]: any };
};

export default class AuthFlowRouteContents extends React.Component<
  ComponentProps,
  {
    component: any;
  }
> {
  state: {
    component: any;
  } = {
    component: null,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.handleProps(this.props);
  }

  componentWillReceiveProps(nextProps: ComponentProps) {
    this.handleProps(nextProps);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return this.state.component;
  }

  handleProps(props: ComponentProps) {
    const { routerProps } = props;

    authFlow.handleRequest(
      {
        path: routerProps.location.pathname,
        params: routerProps.match.params,
        query: routerProps.location.query,
      },
      this.onRedirect.bind(this),
      this.onRouteAllowed.bind(this, props),
    );
  }

  onRedirect(path: string) {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      component: <Redirect to={path} />,
    });
  }

  onRouteAllowed(props: ComponentProps) {
    const { component: Component } = props;

    if (!this._isMounted) {
      return;
    }

    this.setState({
      component: <Component {...props.routerProps} />,
    });
  }
}
