import AuthFlow from 'services/authFlow/AuthFlow';

import RegisterState from 'services/authFlow/RegisterState';
import ActivationState from 'services/authFlow/ActivationState';
import ResendActivationState from 'services/authFlow/ResendActivationState';

describe('AuthFlow.functional', () => {
    let flow;
    let actions;
    let store;
    let state;
    let navigate;

    beforeEach(() => {
        actions = {test: sinon.stub()};
        actions.test.returns('passed');
        store = {
            getState: sinon.stub(),
            dispatch: sinon.spy(({type, payload = {}}) => {
                if (type === '@@router/TRANSITION' && payload.method === 'push') {
                    // emulate redux-router
                    navigate.apply(null, payload.args);
                }
            })
        };

        state = {};

        flow = new AuthFlow(actions);
        flow.setStore(store);

        navigate = function navigate(url) { // emulates router behaviour
            if (navigate.lastUrl !== url) {
                navigate.lastUrl = url;
                flow.handleRequest(url, navigate);
            }
        };

        sinon.stub(flow, 'run');
        sinon.spy(flow, 'navigate');
        store.getState.returns(state);
    });

    describe('guest', () => {
        beforeEach(() => {
            state.user = {
                isGuest: true
            };
        });

        it('should redirect guest / -> /login', () => {
            navigate('/');

            sinon.assert.calledOnce(flow.navigate);
            sinon.assert.calledWithExactly(flow.navigate, '/login');
        });

        it('should redirect guest to /login after /login -> /', () => {
            // this is to ensure, that when AuthFlow is already on LoginState (on /login)
            // it will not allow user to go to / (which is forbidden for users) and will
            // always redirect to /login, so that enter condition of state is always satisfied

            navigate('/login');
            navigate('/');

            sinon.assert.calledTwice(flow.navigate);
            sinon.assert.alwaysCalledWithExactly(flow.navigate, '/login');
        });
    });

    it('should oauth without any rendering if no acceptance required', () => {
        const expectedRedirect = 'foo';

        Object.assign(state, {
            user: {
                isGuest: false,
                isActive: true
            },

            routing: {
                location: {
                    query: {
                    }
                }
            },

            auth: {
                oauth: {
                    clientId: 123
                }
            }
        });

        flow.run.onCall(0).returns({then: (fn) => fn()});
        flow.run.onCall(1).returns({then: (fn) => fn({
            redirectUri: expectedRedirect
        })});

        navigate('/oauth2');

        sinon.assert.calledThrice(flow.run);
        sinon.assert.calledWith(flow.run.getCall(0), 'oAuthValidate');
        sinon.assert.calledWith(flow.run.getCall(1), 'oAuthComplete');
        sinon.assert.calledWithExactly(flow.run.getCall(2), 'redirect', expectedRedirect);
    });

    describe('/resend-activation #goBack()', () => {
        beforeEach(() => {
            state.user = {
                isGuest: true,
                isActive: false
            };

            state.routing = {
                location: {
                    pathname: ''
                }
            };
        });

        it('should goBack to /activation', () => {
            navigate('/activation');
            expect(flow.state).to.be.instanceof(ActivationState);

            flow.state.reject(flow);
            expect(flow.state).to.be.instanceof(ResendActivationState);

            flow.state.goBack(flow);
            expect(flow.state).to.be.instanceof(ActivationState);
        });

        it('should goBack to /register', () => {
            navigate('/register');
            expect(flow.state).to.be.instanceof(RegisterState);

            flow.state.reject(flow, {requestEmail: true});
            expect(flow.state).to.be.instanceof(ResendActivationState);

            flow.state.goBack(flow);
            expect(flow.state).to.be.instanceof(RegisterState);
        });
    });
});
