import sinon, { SinonMock } from 'sinon';

import ActivationState from 'app/services/authFlow/ActivationState';
import CompleteState from 'app/services/authFlow/CompleteState';
import ResendActivationState from 'app/services/authFlow/ResendActivationState';

import { bootstrap, expectState, expectNavigate, expectRun, MockedAuthContext } from './helpers';

describe('ActivationState', () => {
    let state: ActivationState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    beforeEach(() => {
        state = new ActivationState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /activation', () => {
            const expectedPath = '/activation';
            context.getState.returns({
                user: {
                    isActive: false,
                },
            });

            context.getRequest.returns({ path: expectedPath });

            expectNavigate(mock, '/activation');

            state.enter(context);
        });

        it('should navigate to /activation/key', () => {
            const expectedPath = '/activation/sasx5AS4d61';
            context.getState.returns({
                user: {
                    isActive: false,
                },
            });

            context.getRequest.returns({ path: expectedPath });

            expectNavigate(mock, expectedPath);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call activate with payload', () => {
            const payload = { key: 'mock' };

            expectRun(mock, 'activate', sinon.match.same('mock')).returns(new Promise(() => {}));

            state.resolve(context, payload);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context, { key: 'mock' });

            return promise;
        });

        it('should NOT transition to complete state on fail', () => {
            const promise = Promise.reject();

            mock.expects('run').returns(promise);
            mock.expects('setState').never();

            state.resolve(context, { key: 'mock' });

            return promise.catch(mock.verify.bind(mock));
        });
    });

    describe('#reject', () => {
        it('should transition to resend-activation', () => {
            expectState(mock, ResendActivationState);

            state.reject(context);
        });
    });
});
