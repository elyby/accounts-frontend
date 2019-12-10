import React from 'react';
import sinon from 'sinon';
import expect from 'app/test/unexpected';
import { mount } from 'enzyme';
import authFlow from 'app/services/authFlow';

import AuthFlowRouteContents from './AuthFlowRouteContents';

describe('AuthFlowRouteContents', () => {
  beforeEach(() => {
    sinon.stub(authFlow, 'handleRequest');
  });

  afterEach(() => {
    (authFlow.handleRequest as any).restore();
  });

  function Component() {
    return <div />;
  }

  it('should render component if route allowed', () => {
    const authRequest = {
      path: '/path',
      params: { foo: 1 },
      query: new URLSearchParams(),
    };

    const routerProps = {
      location: {
        pathname: authRequest.path,
        search: '',
        query: new URLSearchParams(),
      },
      match: {
        params: authRequest.params,
      },
    } as any;

    (authFlow.handleRequest as any).callsArg(2);

    const wrapper = mount(
      <AuthFlowRouteContents routerProps={routerProps} component={Component} />,
    );

    const component = wrapper.find(Component);

    expect(authFlow.handleRequest, 'to have a call satisfying', [
      {
        ...authRequest,
        query: expect.it('to be a', URLSearchParams),
      },
      expect.it('to be a function'),
      expect.it('to be a function'),
    ]);

    expect(component.exists(), 'to be true');
    expect(component.props(), 'to equal', routerProps);
  });
});
