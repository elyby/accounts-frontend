import AuthFlow from 'services/authFlow/AuthFlow';
import AbstractState from 'services/authFlow/AbstractState';

import OAuthState from 'services/authFlow/OAuthState';
import RegisterState from 'services/authFlow/RegisterState';
import RecoverPasswordState from 'services/authFlow/RecoverPasswordState';
import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';
import ActivationState from 'services/authFlow/ActivationState';
import ResendActivationState from 'services/authFlow/ResendActivationState';
import LoginState from 'services/authFlow/LoginState';

// TODO: navigate and state switching

describe('AuthFlow', () => {
    let flow;
    let actions;

    beforeEach(() => {
        actions = {test: sinon.stub()};
        actions.test.returns('passed');

        flow = new AuthFlow(actions);
    });

    it('throws when no actions provided', () => {
        expect(() => new AuthFlow()).to.throw('AuthFlow requires an actions object');
    });

    it('should not allow to mutate actions', () => {
        expect(() => flow.actions.foo = 'bar').to.throw(/readonly/);
        expect(() => flow.actions.test = 'hacked').to.throw(/readonly/);
    });

    describe('#setState', () => {
        it('should change state', () => {
            const state = new AbstractState();
            flow.setState(state);

            expect(flow.state).to.be.equal(state);
        });

        it('should call #enter() on new state and pass reference to itself', () => {
            const state = new AbstractState();
            const spy = sinon.spy(state, 'enter');

            flow.setState(state);

            sinon.assert.calledWith(spy, flow);
            sinon.assert.calledOnce(spy);
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

            sinon.assert.calledWith(spy1, flow);
            sinon.assert.calledOnce(spy1);
            sinon.assert.notCalled(spy2);
        });

        it('should return promise, if #enter returns it', () => {
            const state = new AbstractState();
            const expected = Promise.resolve();

            state.enter = () => expected;

            const actual = flow.setState(state);

            expect(actual).to.be.equal(expected);
        });

        it('should throw if no state', () => {
            expect(() => flow.setState()).to.throw('State is required');
        });
    });

    describe('#run', () => {
        let store;

        beforeEach(() => {
            store = {
                getState() {},
                dispatch: sinon.stub()
            };

            flow.setStore(store);
        });

        it('should dispatch an action', () => {
            flow.run('test');

            sinon.assert.calledOnce(store.dispatch);
            sinon.assert.calledWith(store.dispatch, 'passed');
        });

        it('should dispatch an action with payload given', () => {
            flow.run('test', 'arg');

            sinon.assert.calledOnce(actions.test);
            sinon.assert.calledWith(actions.test, 'arg');
        });

        it('should return action dispatch result', () => {
            const expected = 'dispatch called';
            store.dispatch.returns(expected);

            expect(flow.run('test')).to.be.equal(expected);
        });

        it('throws when running unexisted action', () => {
            expect(() => flow.run('123')).to.throw('Action 123 does not exists');
        });
    });

    describe('#goBack', () => {
        it('should call goBack on state passing itself as argument', () => {
            const state = new AbstractState();
            sinon.stub(state, 'goBack');
            flow.setState(state);

            flow.goBack();

            sinon.assert.calledOnce(state.goBack);
            sinon.assert.calledWith(state.goBack, flow);
        });
    });

    describe('#resolve', () => {
        it('should call resolve on state passing itself and payload as arguments', () => {
            const state = new AbstractState();
            sinon.stub(state, 'resolve');
            flow.setState(state);

            const expectedPayload = {foo: 'bar'};

            flow.resolve(expectedPayload);

            sinon.assert.calledOnce(state.resolve);
            sinon.assert.calledWithExactly(state.resolve, flow, expectedPayload);
        });
    });

    describe('#reject', () => {
        it('should call reject on state passing itself and payload as arguments', () => {
            const state = new AbstractState();
            sinon.stub(state, 'reject');
            flow.setState(state);

            const expectedPayload = {foo: 'bar'};

            flow.reject(expectedPayload);

            sinon.assert.calledOnce(state.reject);
            sinon.assert.calledWithExactly(state.reject, flow, expectedPayload);
        });
    });

    describe('#handleRequest()', () => {
        beforeEach(() => {
            sinon.stub(flow, 'setState');
            sinon.stub(flow, 'run');
        });

        Object.entries({
            '/': LoginState,
            '/login': LoginState,
            '/password': LoginState,
            '/change-password': LoginState,
            '/oauth/permissions': LoginState,
            '/oauth/finish': LoginState,
            '/oauth': OAuthState,
            '/register': RegisterState,
            '/recover-password': RecoverPasswordState,
            '/recover-password/key123': RecoverPasswordState,
            '/forgot-password': ForgotPasswordState,
            '/activation': ActivationState,
            '/resend-activation': ResendActivationState
        }).forEach(([path, type]) => {
            it(`should transition to ${type.name} if ${path}`, () => {
                flow.handleRequest(path);

                sinon.assert.calledOnce(flow.setState);
                sinon.assert.calledWithExactly(flow.setState, sinon.match.instanceOf(type));
            });
        });

        it('should run setOAuthRequest if /', () => {
            flow.handleRequest('/');

            sinon.assert.calledOnce(flow.run);
            sinon.assert.calledWithExactly(flow.run, 'setOAuthRequest', {});
        });

        it('should call callback', () => {
            const callback = sinon.stub();

            flow.handleRequest('/', () => {}, callback);

            sinon.assert.calledOnce(callback);
        });

        it('should not call callback till returned from #enter() promise will be resolved', () => {
            let resolve;
            const promise = {then: (cb) => {resolve = cb;}};
            const callback = sinon.stub();
            const state = new AbstractState();
            state.enter = () => promise;

            flow.setState = AuthFlow.prototype.setState.bind(flow, state);

            flow.handleRequest('/', () => {}, callback);

            expect(resolve).to.be.a('function');

            sinon.assert.notCalled(callback);
            resolve();
            sinon.assert.calledOnce(callback);
        });

        it('should not handle the same request twice', () => {
            const path = '/oauth';
            const callback = sinon.stub();

            flow.handleRequest(path, () => {}, callback);
            flow.handleRequest(path, () => {}, callback);

            sinon.assert.calledOnce(flow.setState);
            sinon.assert.calledTwice(callback);
            sinon.assert.calledWithExactly(flow.setState, sinon.match.instanceOf(OAuthState));
        });

        it('throws if unsupported request', () => {
            expect(() => flow.handleRequest('/foo/bar')).to.throw('Unsupported request: /foo/bar');
        });
    });
});
