import sinon, { SinonMock } from 'sinon';

import PermissionsState from 'app/services/authFlow/PermissionsState';
import CompleteState from 'app/services/authFlow/CompleteState';

import { bootstrap, expectNavigate, MockedAuthContext } from './helpers';

describe('PermissionsState', () => {
    let state: PermissionsState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    beforeEach(() => {
        state = new PermissionsState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /oauth/permissions', () => {
            context.getRequest.returns({
                path: '/',
            });

            expectNavigate(mock, '/oauth/permissions', {
                replace: false,
            });

            state.enter(context);
        });

        it('should replace instead of push if current request contains oauth2', () => {
            context.getRequest.returns({
                path: '/oauth2',
            });

            expectNavigate(mock, '/oauth/permissions', {
                replace: true,
            });

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should transition to complete state with acceptance', () => {
            mock.expects('setState')
                .once()
                .withExactArgs(
                    sinon.match.instanceOf(CompleteState).and(sinon.match.has('isPermissionsAccepted', true)),
                );

            state.resolve(context);
        });
    });

    describe('#reject', () => {
        it('should transition to complete state without acceptance', () => {
            mock.expects('setState')
                .once()
                .withExactArgs(
                    sinon.match.instanceOf(CompleteState).and(sinon.match.has('isPermissionsAccepted', false)),
                );

            state.reject(context);
        });
    });
});
