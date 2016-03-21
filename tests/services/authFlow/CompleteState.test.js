import CompleteState from 'services/authFlow/CompleteState';
import LoginState from 'services/authFlow/LoginState';
import ActivationState from 'services/authFlow/ActivationState';
import ChangePasswordState from 'services/authFlow/ChangePasswordState';
import FinishState from 'services/authFlow/FinishState';
import PermissionsState from 'services/authFlow/PermissionsState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('CompleteState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new CompleteState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to / for authenticated', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {}
            });

            expectNavigate(mock, '/');

            state.enter(context);
        });

        it('should transition to login for guests', () => {
            context.getState.returns({
                user: {
                    isGuest: true
                },
                auth: {}
            });

            expectState(mock, LoginState);

            state.enter(context);
        });

        it('should transition to activation if account is not activated', () => {
            context.getState.returns({
                user: {
                    isGuest: false
                },
                auth: {}
            });

            expectState(mock, ActivationState);

            state.enter(context);
        });

        it('should transition to change-password if shouldChangePassword', () => {
            context.getState.returns({
                user: {
                    shouldChangePassword: true,
                    isActive: true,
                    isGuest: false
                },
                auth: {}
            });

            expectState(mock, ChangePasswordState);

            state.enter(context);
        });

        it('should transition to activation with higher priority than shouldChangePassword', () => {
            context.getState.returns({
                user: {
                    shouldChangePassword: true,
                    isGuest: false
                },
                auth: {}
            });

            expectState(mock, ActivationState);

            state.enter(context);
        });

        it('should transition to finish state if code is present', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        code: 'XXX'
                    }
                }
            });

            expectState(mock, FinishState);

            state.enter(context);
        });
    });

    describe('oAuthComplete', () => {
        it('should run oAuthComplete', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by'
                    }
                }
            });

            expectRun(
                mock,
                'oAuthComplete',
                sinon.match.object
            ).returns({then() {}});

            state.enter(context);
        });

        it('should listen for auth success/failure', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by'
                    }
                }
            });

            expectRun(
                mock,
                'oAuthComplete',
                sinon.match.object
            ).returns({then(success, fail) {
                expect(success).to.be.a('function');
                expect(fail).to.be.a('function');
            }});

            state.enter(context);
        });

        it('should transition run redirect by default', () => {
            const expectedUrl = 'foo/bar';
            const promise = Promise.resolve({redirectUri: expectedUrl});

            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by'
                    }
                }
            });

            expectRun(
                mock,
                'oAuthComplete',
                sinon.match.object
            ).returns(promise);
            expectRun(
                mock,
                'redirect',
                expectedUrl
            );

            state.enter(context);

            return promise.catch(mock.verify.bind(mock));
        });

        const testOAuth = (type, resp, expectedInstance) => {
            const promise = Promise[type](resp);

            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by'
                    }
                }
            });

            expectRun(
                mock,
                'oAuthComplete',
                sinon.match.object
            ).returns(promise);
            expectState(mock, expectedInstance);

            state.enter(context);

            return promise.catch(mock.verify.bind(mock));
        };

        it('should transition to finish state if rejected with static_page', () => {
            return testOAuth('resolve', {redirectUri: 'static_page'}, FinishState);
        });

        it('should transition to finish state if rejected with static_page_with_code', () => {
            return testOAuth('resolve', {redirectUri: 'static_page_with_code'}, FinishState);
        });

        it('should transition to login state if rejected with unauthorized', () => {
            return testOAuth('reject', {unauthorized: true}, LoginState);
        });

        it('should transition to permissions state if rejected with acceptRequired', () => {
            return testOAuth('reject', {acceptRequired: true}, PermissionsState);
        });
    })

    describe('permissions accept', () => {
        it('should set flags, when user accepted permissions', () => {
            state = new CompleteState();
            expect(state.isPermissionsAccepted).to.be.undefined;

            state = new CompleteState({accept: undefined});
            expect(state.isPermissionsAccepted).to.be.undefined;

            state = new CompleteState({accept: true});
            expect(state.isPermissionsAccepted).to.be.true;

            state = new CompleteState({accept: false});
            expect(state.isPermissionsAccepted).to.be.false;
        });

        it('should run oAuthComplete passing accept: true', () => {
            const expected = {accept: true};

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by'
                    }
                }
            });

            mock.expects('run').once().withExactArgs(
                'oAuthComplete',
                sinon.match(expected)
            ).returns({then() {}});

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: false', () => {
            const expected = {accept: false};

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by'
                    }
                }
            });

            expectRun(
                mock,
                'oAuthComplete',
                sinon.match(expected)
            ).returns({then() {}});

            state.enter(context);
        });
    });
});
