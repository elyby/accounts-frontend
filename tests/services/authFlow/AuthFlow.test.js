import expect from 'unexpected';

import AuthFlow from 'services/authFlow/AuthFlow';
import AbstractState from 'services/authFlow/AbstractState';

import OAuthState from 'services/authFlow/OAuthState';
import RegisterState from 'services/authFlow/RegisterState';
import AcceptRulesState from 'services/authFlow/AcceptRulesState';
import RecoverPasswordState from 'services/authFlow/RecoverPasswordState';
import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';
import ActivationState from 'services/authFlow/ActivationState';
import ResendActivationState from 'services/authFlow/ResendActivationState';
import LoginState from 'services/authFlow/LoginState';

describe('AuthFlow', () => {
    let flow;
    let actions;

    beforeEach(() => {
        actions = {
            test: sinon.stub().named('actions.test')
        };
        actions.test.returns('passed');

        flow = new AuthFlow(actions);
    });

    it('throws when no actions provided', () => {
        expect(() => new AuthFlow(), 'to throw', 'AuthFlow requires an actions object');
    });

    it('should not allow to mutate actions', () => {
        expect(() => flow.actions.foo = 'bar', 'to throw', /readonly/);
        expect(() => flow.actions.test = 'hacked', 'to throw', /readonly/);
    });

    describe('#setState', () => {
        it('should change state', () => {
            const state = new AbstractState();
            flow.setState(state);

            expect(flow.state, 'to be', state);
        });

        it('should call #enter() on new state and pass reference to itself', () => {
            const state = new AbstractState();
            const spy = sinon.spy(state, 'enter').named('state.enter');

            flow.setState(state);

            expect(spy, 'was called once');
            expect(spy, 'to have a call satisfying', [flow]);
        });

        it('should call `leave` on previous state if any', () => {
            class State1 extends AbstractState {}
            class State2 extends AbstractState {}

            const state1 = new State1();
            const state2 = new State2();
            const spy1 = sinon.spy(state1, 'leave');
            const spy2 = sinon.spy(state2, 'leave');

            flow.setState(state1);
            flow.setState(state2);

            expect(spy1, 'was called once');
            expect(spy1, 'to have a call satisfying', [flow]);
            expect(spy2, 'was not called');
        });

        it('should return promise, if #enter returns it', () => {
            const state = new AbstractState();
            const expected = Promise.resolve();

            state.enter = () => expected;

            const actual = flow.setState(state);

            expect(actual, 'to be', expected);
        });

        it('should throw if no state', () => {
            expect(() => flow.setState(), 'to throw', 'State is required');
        });
    });

    describe('#run', () => {
        let store;

        beforeEach(() => {
            store = {
                getState() {},
                dispatch: sinon.stub().named('store.dispatch')
            };

            flow.setStore(store);
        });

        it('should dispatch an action', () => {
            flow.run('test');

            expect(store.dispatch, 'was called once');
            expect(store.dispatch, 'to have a call satisfying', ['passed']);
        });

        it('should dispatch an action with payload given', () => {
            flow.run('test', 'arg');

            expect(actions.test, 'was called once');
            expect(actions.test, 'to have a call satisfying', ['arg']);
        });

        it('should return action dispatch result', () => {
            const expected = 'dispatch called';
            store.dispatch.returns(expected);

            expect(flow.run('test'), 'to be', expected);
        });

        it('throws when running unexisted action', () => {
            expect(() => flow.run('123'), 'to throw', 'Action 123 does not exists');
        });
    });

    describe('#goBack', () => {
        it('should call goBack on state passing itself as argument', () => {
            const state = new AbstractState();
            sinon.stub(state, 'goBack').named('state.goBack');
            flow.setState(state);

            flow.goBack();

            expect(state.goBack, 'was called once');
            expect(state.goBack, 'to have a call satisfying', [flow]);
        });
    });

    describe('#resolve', () => {
        it('should call resolve on state passing itself and payload as arguments', () => {
            const state = new AbstractState();
            sinon.stub(state, 'resolve').named('state.resolve');
            flow.setState(state);

            const expectedPayload = {foo: 'bar'};

            flow.resolve(expectedPayload);

            expect(state.resolve, 'was called once');
            expect(state.resolve, 'to have a call satisfying', [flow, expectedPayload]);
        });
    });

    describe('#reject', () => {
        it('should call reject on state passing itself and payload as arguments', () => {
            const state = new AbstractState();
            sinon.stub(state, 'reject').named('state.reject');
            flow.setState(state);

            const expectedPayload = {foo: 'bar'};

            flow.reject(expectedPayload);

            expect(state.reject, 'was called once');
            expect(state.reject, 'to have a call satisfying', [flow, expectedPayload]);
        });
    });

    describe('#handleRequest()', () => {
        beforeEach(() => {
            sinon.stub(flow, 'setState').named('flow.setState');
            sinon.stub(flow, 'run').named('flow.run');
        });

        Object.entries({
            '/': LoginState,
            '/login': LoginState,
            '/password': LoginState,
            '/accept-rules': LoginState,
            '/oauth/permissions': LoginState,
            '/oauth/finish': LoginState,
            '/oauth2/v1': OAuthState,
            '/oauth2': OAuthState,
            '/register': RegisterState,
            '/recover-password': RecoverPasswordState,
            '/recover-password/key123': RecoverPasswordState,
            '/forgot-password': ForgotPasswordState,
            '/activation': ActivationState,
            '/resend-activation': ResendActivationState
        }).forEach(([path, type]) => {
            it(`should transition to ${type.name} if ${path}`, () => {
                flow.handleRequest(path);

                expect(flow.setState, 'was called once');
                expect(flow.setState, 'to have a call satisfying', [
                    expect.it('to be a', type)
                ]);
            });
        });

        it('should run setOAuthRequest if /', () => {
            flow.handleRequest('/');

            expect(flow.run, 'was called once');
            expect(flow.run, 'to have a call satisfying', ['setOAuthRequest', {}]);
        });

        it('should call callback', () => {
            const callback = sinon.stub().named('callback');

            flow.handleRequest('/', () => {}, callback);

            expect(callback, 'was called once');
        });

        it('should not call callback till returned from #enter() promise will be resolved', () => {
            let resolve;
            const promise = {then: (cb) => {resolve = cb;}};
            const callback = sinon.stub().named('callback');

            const state = new AbstractState();
            state.enter = () => promise;

            flow.setState = AuthFlow.prototype.setState.bind(flow, state);

            flow.handleRequest('/', () => {}, callback);

            expect(resolve, 'to be', callback);

            expect(callback, 'was not called');
            resolve();
            expect(callback, 'was called once');
        });

        it('should not handle the same request twice', () => {
            const path = '/oauth2';
            const callback = sinon.stub();

            flow.handleRequest(path, () => {}, callback);
            flow.handleRequest(path, () => {}, callback);

            expect(flow.setState, 'was called once');
            expect(flow.setState, 'to have a call satisfying', [
                expect.it('to be a', OAuthState)
            ]);
            expect(callback, 'was called twice');
        });

        it('throws if unsupported request', () => {
            expect(() => flow.handleRequest('/foo/bar'), 'to throw', 'Unsupported request: /foo/bar');
        });
    });
});
