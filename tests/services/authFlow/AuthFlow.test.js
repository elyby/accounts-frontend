import AuthFlow from 'services/authFlow/AuthFlow';
import AbstractState from 'services/authFlow/AbstractState';

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

        it('should call `enter` on new state and pass reference to itself', () => {
            const state = new AbstractState();
            const spy = sinon.spy(state, 'enter');

            flow.setState(state);

            sinon.assert.calledWith(spy, flow);
            sinon.assert.calledOnce(spy);
        });

        it('should call `leave` on previous state if any', () => {
            const state1 = new AbstractState();
            const state2 = new AbstractState();
            const spy1 = sinon.spy(state1, 'leave');
            const spy2 = sinon.spy(state2, 'leave');

            flow.setState(state1);
            flow.setState(state2);

            sinon.assert.calledWith(spy1, flow);
            sinon.assert.calledOnce(spy1);
            sinon.assert.notCalled(spy2);
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
});
