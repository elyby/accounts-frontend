import expect from 'app/test/unexpected';
import sinon, { SinonStub } from 'sinon';

import AuthFlow from 'app/services/authFlow/AuthFlow';
import AbstractState from 'app/services/authFlow/AbstractState';
import localStorage from 'app/services/localStorage';

import OAuthState from 'app/services/authFlow/OAuthState';
import RegisterState from 'app/services/authFlow/RegisterState';
import RecoverPasswordState from 'app/services/authFlow/RecoverPasswordState';
import ForgotPasswordState from 'app/services/authFlow/ForgotPasswordState';
import ActivationState from 'app/services/authFlow/ActivationState';
import ResendActivationState from 'app/services/authFlow/ResendActivationState';
import LoginState from 'app/services/authFlow/LoginState';
import CompleteState from 'app/services/authFlow/CompleteState';
import ChooseAccountState from 'app/services/authFlow/ChooseAccountState';
import { Store } from 'redux';

describe('AuthFlow', () => {
    let flow: AuthFlow;
    let actions: { test: SinonStub };

    beforeEach(() => {
        actions = {
            test: sinon.stub().named('actions.test'),
        };
        actions.test.returns('passed');

        // @ts-ignore
        flow = new AuthFlow(actions);
    });

    it('should not allow to mutate actions', () => {
        expect(
            // @ts-ignore
            () => (flow.actions.foo = 'bar'),
            'to throw',
            /readonly|not extensible/,
        );
        // @ts-ignore
        expect(() => (flow.actions.test = 'hacked'), 'to throw', /read ?only/);
    });

    describe('#setStore', () => {
        it('should create #navigate, #getState, #dispatch', () => {
            flow.setStore({
                // @ts-ignore
                getState() {},
                // @ts-ignore
                dispatch() {},
            });

            expect(flow.getState, 'to be defined');
            expect(flow.dispatch, 'to be defined');
            expect(flow.navigate, 'to be defined');
        });
    });

    describe('#restoreOAuthState', () => {
        let oauthData: Record<string, string>;

        beforeEach(() => {
            oauthData = { foo: 'bar' };
            localStorage.setItem(
                'oauthData',
                JSON.stringify({
                    timestamp: Date.now() - 10,
                    payload: oauthData,
                }),
            );

            sinon.stub(flow, 'run').named('flow.run');
            const promiseLike = { then: (fn: Function) => fn() || promiseLike };
            // @ts-ignore
            flow.run.returns(promiseLike);
            sinon.stub(flow, 'setState').named('flow.setState');
        });

        afterEach(() => {
            localStorage.removeItem('oauthData');
        });

        it('should call to restoreOAuthState', () => {
            // @ts-ignore
            sinon.stub(flow, 'restoreOAuthState').named('flow.restoreOAuthState');

            flow.handleRequest(
                { path: '/', query: new URLSearchParams(''), params: {} },
                () => {},
                () => {},
            );

            // @ts-ignore
            expect(flow.restoreOAuthState, 'was called');
        });

        it('should restore oauth state from localStorage', () => {
            flow.handleRequest(
                { path: '/', query: new URLSearchParams(''), params: {} },
                () => {},
                () => {},
            );

            expect(flow.run, 'to have a call satisfying', ['oAuthValidate', oauthData]);
        });

        it('should transition to CompleteState', () => {
            flow.handleRequest(
                { path: '/', query: new URLSearchParams(''), params: {} },
                () => {},
                () => {},
            );

            expect(flow.setState, 'to have a call satisfying', [expect.it('to be a', CompleteState)]);
        });

        it('should not handle current request', () => {
            flow.handleRequest(
                { path: '/', query: new URLSearchParams(''), params: {} },
                () => {},
                () => {},
            );

            expect(flow.setState, 'was called once');
        });

        it('should call onReady after state restoration', () => {
            const onReady = sinon.stub().named('onReady');

            flow.handleRequest(
                { path: '/login', query: new URLSearchParams(''), params: {} },
                // @ts-ignore
                null,
                onReady,
            );

            expect(onReady, 'was called');
        });

        it('should not restore oauth state for /register route', () => {
            flow.handleRequest(
                { path: '/register', query: new URLSearchParams(''), params: {} },
                () => {},
                () => {},
            );

            expect(flow.run, 'was not called'); // this.run('oAuthValidate'...
        });

        it('should not restore outdated (>1h) oauth state', () => {
            localStorage.setItem(
                'oauthData',
                JSON.stringify({
                    timestamp: Date.now() - 2 * 60 * 60 * 1000,
                    payload: oauthData,
                }),
            );

            flow.handleRequest(
                { path: '/', query: new URLSearchParams(''), params: {} },
                () => {},
                () => {},
            );

            expect(flow.run, 'was not called');
        });
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
            // @ts-ignore
            expect(() => flow.setState(), 'to throw', 'State is required');
        });
    });

    describe('#run', () => {
        let store: Store;

        beforeEach(() => {
            // @ts-ignore
            store = {
                getState() {},
                dispatch: sinon.stub().named('store.dispatch'),
            };

            flow.setStore(store);
        });

        it('should dispatch an action', () => {
            // @ts-ignore
            flow.run('test');

            expect(store.dispatch, 'was called once');
            expect(store.dispatch, 'to have a call satisfying', ['passed']);
        });

        it('should dispatch an action with payload given', () => {
            // @ts-ignore
            flow.run('test', 'arg');

            expect(actions.test, 'was called once');
            expect(actions.test, 'to have a call satisfying', ['arg']);
        });

        it('should resolve to action dispatch result', () => {
            const expected = 'dispatch called';
            // @ts-ignore
            store.dispatch.returns(expected);

            // @ts-ignore
            return expect(flow.run('test'), 'to be fulfilled with', expected);
        });

        it('throws when running unexisted action', () => {
            // @ts-ignore
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

            const expectedPayload = { foo: 'bar' };

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

            const expectedPayload = { foo: 'bar' };

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
            '/oauth/choose-account': LoginState,
            '/oauth/finish': LoginState,
            '/oauth2/v1/foo': OAuthState,
            '/oauth2/v1': OAuthState,
            '/oauth2': OAuthState,
            '/register': RegisterState,
            '/choose-account': ChooseAccountState,
            '/recover-password': RecoverPasswordState,
            '/recover-password/key123': RecoverPasswordState,
            '/forgot-password': ForgotPasswordState,
            '/activation': ActivationState,
            '/resend-activation': ResendActivationState,
        }).forEach(([path, type]) => {
            it(`should transition to ${type.name} if ${path}`, () => {
                flow.handleRequest(
                    { path, query: new URLSearchParams({}), params: {} },
                    () => {},
                    () => {},
                );

                expect(flow.setState, 'was called once');
                expect(flow.setState, 'to have a call satisfying', [expect.it('to be a', type)]);
            });
        });

        it('should call callback', () => {
            const callback = sinon.stub().named('callback');

            flow.handleRequest({ path: '/', query: new URLSearchParams({}), params: {} }, () => {}, callback);

            expect(callback, 'was called once');
        });

        it('should not call callback till returned from #enter() promise will be resolved', () => {
            let resolve: Function;
            const promise: Promise<void> = {
                // @ts-ignore
                then: (cb: Function) => {
                    resolve = cb;
                },
            };
            const callback = sinon.stub().named('callback');

            const state = new AbstractState();
            state.enter = () => promise;

            flow.setState = AuthFlow.prototype.setState.bind(flow, state);

            flow.handleRequest({ path: '/', query: new URLSearchParams({}), params: {} }, () => {}, callback);

            // @ts-ignore
            expect(resolve, 'to be', callback);

            expect(callback, 'was not called');
            // @ts-ignore
            resolve();
            expect(callback, 'was called once');
        });

        it('should not handle the same request twice', () => {
            const path = '/oauth2';
            const callback = sinon.stub();

            flow.handleRequest({ path, query: new URLSearchParams({}), params: {} }, () => {}, callback);
            flow.handleRequest({ path, query: new URLSearchParams({}), params: {} }, () => {}, callback);

            expect(flow.setState, 'was called once');
            expect(flow.setState, 'to have a call satisfying', [expect.it('to be a', OAuthState)]);
            expect(callback, 'was called twice');
        });

        it('throws if unsupported request', () => {
            const replace = sinon.stub().named('replace');

            flow.handleRequest({ path: '/foo/bar', query: new URLSearchParams({}), params: {} }, replace);

            expect(replace, 'to have a call satisfying', ['/404']);
        });
    });

    describe('#getRequest()', () => {
        beforeEach(() => {
            sinon.stub(flow, 'setState').named('flow.setState');
            sinon.stub(flow, 'run').named('flow.run');
        });

        it('should return request with path, query, params', () => {
            const request = { path: '/', query: new URLSearchParams({}), params: {} };

            flow.handleRequest(
                request,
                () => {},
                () => {},
            );

            expect(flow.getRequest(), 'to satisfy', {
                ...request,
                query: expect.it('to be an', URLSearchParams),
                params: {},
            });
        });

        it('should return a copy of current request', () => {
            const request = {
                path: '/',
                query: new URLSearchParams({ foo: 'bar' }),
                params: { baz: 'bud' },
            };

            flow.handleRequest(
                request,
                () => {},
                () => {},
            );

            expect(flow.getRequest(), 'to equal', request);
            expect(flow.getRequest(), 'not to be', request);
        });
    });
});
