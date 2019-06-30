import React from 'react';
import sinon from 'sinon';
import expect from 'test/unexpected';
import { mount } from 'enzyme';

import authFlow from 'services/authFlow';

import AuthFlowRouteContents from './AuthFlowRouteContents';

describe('AuthFlowRouteContents', () => {
    beforeEach(() => {
        sinon.stub(authFlow, 'handleRequest');
    });

    afterEach(() => {
        authFlow.handleRequest.restore();
    });

    function Component() {
        return <div />;
    }

    it('should render component if route allowed', () => {
        const request = {
            path: '/path',
            params: { foo: 1 },
            query: new URLSearchParams()
        };

        const routerProps = {
            location: {
                pathname: request.path,
                query: request.query
            },
            match: {
                params: request.params
            }
        };

        authFlow.handleRequest.callsArg(2);

        const wrapper = mount(
            <AuthFlowRouteContents
                routerProps={routerProps}
                component={Component}
            />
        );

        const component = wrapper.find(Component);

        expect(authFlow.handleRequest, 'to have a call satisfying', [
            request,
            expect.it('to be a function'),
            expect.it('to be a function')
        ]);

        expect(component.exists(), 'to be true');
        expect(component.props(), 'to equal', routerProps);
    });
});
