/**
 * A helpers for testing states in isolation from AuthFlow
 */

import sinon, { SinonExpectation, SinonMock, SinonStub } from 'sinon';
import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';

export interface MockedAuthContext extends AuthContext {
    getState: SinonStub;
    getRequest: SinonStub;
}

export function bootstrap(): { context: MockedAuthContext; mock: SinonMock } {
    const context: MockedAuthContext = {
        getState: sinon.stub(),
        run() {
            return Promise.resolve();
        },
        setState() {},
        getRequest: sinon.stub(),
        navigate() {},
        prevState: new (class State extends AbstractState {})(),
    };

    const mock = sinon.mock(context);
    mock.expects('run').never();
    mock.expects('navigate').never();
    mock.expects('setState').never();

    return { context, mock };
}

export function expectState(mock: SinonMock, state: typeof AbstractState): SinonExpectation {
    return mock.expects('setState').once().withExactArgs(sinon.match.instanceOf(state));
}

export function expectNavigate(mock: SinonMock, route: string, options: Record<string, any> | void): SinonExpectation {
    if (options) {
        return mock.expects('navigate').once().withExactArgs(route, sinon.match(options));
    }

    return mock.expects('navigate').once().withExactArgs(route);
}

export function expectRun(mock: SinonMock, ...args: Array<any>): SinonExpectation {
    return mock
        .expects('run')
        .once()
        .withExactArgs(...args);
}
