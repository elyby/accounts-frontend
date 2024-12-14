import React from 'react';
import sinon from 'sinon';
import uxpect from 'app/test/unexpected';
import { render, screen } from '@testing-library/react';
import authFlow from 'app/services/authFlow';

import AuthFlowRouteContents from './AuthFlowRouteContents';

describe('AuthFlowRouteContents', () => {
    beforeEach(() => {
        sinon.stub(authFlow, 'handleRequest');
    });

    afterEach(() => {
        (authFlow.handleRequest as any).restore();
    });

    let componentProps: { [key: string]: any };

    function Component(props: { [key: string]: any }) {
        componentProps = props;

        return <div data-testid="test-component" />;
    }

    it('should render component if route allowed', () => {
        const authRequest = {
            path: '/path',
            params: { foo: 1 },
            query: new URLSearchParams(),
        };

        const routerProps: any = {
            location: {
                pathname: authRequest.path,
                search: '',
                query: new URLSearchParams(),
            },
            match: {
                params: authRequest.params,
            },
        };

        (authFlow.handleRequest as any).callsArg(2);

        render(<AuthFlowRouteContents component={Component} {...routerProps} />);

        const component = screen.getByTestId('test-component');

        uxpect(authFlow.handleRequest, 'to have a call satisfying', [
            {
                ...authRequest,
                query: uxpect.it('to be a', URLSearchParams),
            },
            uxpect.it('to be a function'),
            uxpect.it('to be a function'),
        ]);

        expect(component).toBeInTheDocument();
        uxpect(componentProps, 'to equal', routerProps);
    });
});
