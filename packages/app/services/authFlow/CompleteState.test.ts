import expect from 'app/test/unexpected';
import sinon, { SinonMock } from 'sinon';

import CompleteState from 'app/services/authFlow/CompleteState';
import LoginState from 'app/services/authFlow/LoginState';
import ActivationState from 'app/services/authFlow/ActivationState';
import AcceptRulesState from 'app/services/authFlow/AcceptRulesState';
import FinishState from 'app/services/authFlow/FinishState';
import PermissionsState from 'app/services/authFlow/PermissionsState';
import ChooseAccountState from 'app/services/authFlow/ChooseAccountState';
import { Account } from 'app/components/accounts/reducer';
import AbstractState from './AbstractState';

import { bootstrap, expectState, expectNavigate, expectRun, MockedAuthContext } from './helpers';

describe('CompleteState', () => {
    let state: CompleteState;
    let context: MockedAuthContext;
    let mock: SinonMock;

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
                    isGuest: false,
                },
                auth: {},
            });

            expectNavigate(mock, '/');

            state.enter(context);
        });

        it('should transition to login for guests', () => {
            context.getState.returns({
                user: {
                    isGuest: true,
                },
                auth: {},
            });

            expectState(mock, LoginState);

            state.enter(context);
        });

        it('should transition to activation if account is not activated', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {},
            });

            expectState(mock, ActivationState);

            state.enter(context);
        });

        it('should transition to accept-rules if shouldAcceptRules', () => {
            context.getState.returns({
                user: {
                    shouldAcceptRules: true,
                    isActive: true,
                    isGuest: false,
                },
                auth: {},
            });

            expectState(mock, AcceptRulesState);

            state.enter(context);
        });

        it('should transition to activation with higher priority than shouldAcceptRules', () => {
            context.getState.returns({
                user: {
                    shouldAcceptRules: true,
                    isGuest: false,
                },
                auth: {},
            });

            expectState(mock, ActivationState);

            state.enter(context);
        });

        it('should transition to finish state if code is present', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        code: 'XXX',
                    },
                },
            });

            expectState(mock, FinishState);

            state.enter(context);
        });

        it('should transition to permissions state if acceptRequired', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        acceptRequired: true,
                    },
                },
            });

            expectState(mock, PermissionsState);

            state.enter(context);
        });

        it('should transition to permissions state if prompt=consent', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: ['consent'],
                    },
                },
            });

            expectState(mock, PermissionsState);

            state.enter(context);
        });

        it('should transition to ChooseAccountState if user has multiple accs and switcher enabled', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                accounts: {
                    available: [{ id: 1 }, { id: 2 }],
                    active: 1,
                },
                auth: {
                    isSwitcherEnabled: true,
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectState(mock, ChooseAccountState);

            state.enter(context);
        });

        it('should NOT transition to ChooseAccountState if user has multiple accs and switcher disabled', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                accounts: {
                    available: [{ id: 1 }, { id: 2 }],
                    active: 1,
                },
                auth: {
                    isSwitcherEnabled: false,
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', {}).returns({ then() {} });

            state.enter(context);
        });

        it('should transition to ChooseAccountState if prompt=select_account and switcher enabled', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                accounts: {
                    available: [{ id: 1 }],
                    active: 1,
                },
                auth: {
                    isSwitcherEnabled: true,
                    oauth: {
                        clientId: 'ely.by',
                        prompt: ['select_account'],
                    },
                },
            });

            expectState(mock, ChooseAccountState);

            state.enter(context);
        });

        it('should NOT transition to ChooseAccountState if prompt=select_account and switcher disabled', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                accounts: {
                    available: [{ id: 1 }],
                    active: 1,
                },
                auth: {
                    isSwitcherEnabled: false,
                    oauth: {
                        clientId: 'ely.by',
                        prompt: ['select_account'],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', {}).returns({ then() {} });

            state.enter(context);
        });
    });

    describe('when user completes oauth', () => {
        it('should run oAuthComplete', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match.object).returns({
                then() {},
            });

            state.enter(context);
        });

        it('should listen for auth success/failure', () => {
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match.object).returns({
                then(success: Function, fail: Function) {
                    expect(success, 'to be a', 'function');
                    expect(fail, 'to be a', 'function');
                },
            });

            state.enter(context);
        });

        it('should run redirect by default', () => {
            const expectedUrl = 'foo/bar';
            const promise = Promise.resolve({ redirectUri: expectedUrl });

            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match.object).returns(promise);
            expectRun(mock, 'redirect', expectedUrl);

            state.enter(context);

            return promise.catch(mock.verify.bind(mock));
        });

        const testOAuth = (
            type: 'resolve' | 'reject',
            resp: Record<string, any>,
            expectedInstance: typeof AbstractState,
        ) => {
            // @ts-ignore
            const promise = Promise[type](resp);

            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match.object).returns(promise);
            expectState(mock, expectedInstance);

            state.enter(context);

            return promise.catch(mock.verify.bind(mock));
        };

        it('should transition to finish state if rejected with static_page', () =>
            testOAuth('resolve', { redirectUri: 'static_page' }, FinishState));

        it('should transition to finish state if rejected with static_page_with_code', () =>
            testOAuth('resolve', { redirectUri: 'static_page_with_code' }, FinishState));

        it('should transition to login state if rejected with unauthorized', () =>
            testOAuth('reject', { unauthorized: true }, LoginState));

        it('should transition to permissions state if rejected with acceptRequired', () =>
            testOAuth('reject', { acceptRequired: true }, PermissionsState));

        describe('when loginHint is set', () => {
            const testSuccessLoginHint = (field: keyof Account) => {
                const account: Account = {
                    id: 9,
                    email: 'some@email.com',
                    username: 'thatUsername',
                    token: '',
                    refreshToken: '',
                };

                context.getState.returns({
                    user: {
                        isActive: true,
                        isGuest: false,
                    },
                    accounts: {
                        available: [account],
                        active: 100,
                    },
                    auth: {
                        oauth: {
                            clientId: 'ely.by',
                            loginHint: account[field],
                            prompt: [],
                        },
                    },
                });

                expectRun(mock, 'setAccountSwitcher', false);
                expectRun(mock, 'authenticate', account).returns(Promise.resolve());
                expectState(mock, CompleteState);

                return expect(state.enter(context), 'to be fulfilled');
            };

            it('should authenticate account if id matches', () => testSuccessLoginHint('id'));

            it('should authenticate account if email matches', () => testSuccessLoginHint('email'));

            it('should authenticate account if username matches', () => testSuccessLoginHint('username'));

            it('should not authenticate if account is already authenticated', () => {
                const account = {
                    id: 9,
                    email: 'some@email.com',
                    username: 'thatUsername',
                };

                context.getState.returns({
                    user: {
                        isActive: true,
                        isGuest: false,
                    },
                    accounts: {
                        available: [account],
                        active: account.id,
                    },
                    auth: {
                        oauth: {
                            clientId: 'ely.by',
                            loginHint: account.id,
                            prompt: [],
                        },
                    },
                });

                expectRun(mock, 'setAccountSwitcher', false);
                expectRun(mock, 'oAuthComplete', {}).returns({
                    then: () => Promise.resolve(),
                });

                return expect(state.enter(context), 'to be fulfilled');
            });

            it('should not authenticate if account was not found and continue auth', () => {
                const account = {
                    id: 9,
                    email: 'some@email.com',
                    username: 'thatUsername',
                };

                context.getState.returns({
                    user: {
                        isActive: true,
                        isGuest: false,
                    },
                    accounts: {
                        available: [{ id: 1 }],
                        active: 1,
                    },
                    auth: {
                        oauth: {
                            clientId: 'ely.by',
                            loginHint: account.id,
                            prompt: [],
                        },
                    },
                });

                expectRun(mock, 'oAuthComplete', {}).returns({
                    then: () => Promise.resolve(),
                });

                return expect(state.enter(context), 'to be fulfilled');
            });
        });
    });

    describe('permissions accept', () => {
        it('should set flags, when user accepted permissions', () => {
            state = new CompleteState();
            expect(state.isPermissionsAccepted, 'to be undefined');

            state = new CompleteState({ accept: undefined });
            expect(state.isPermissionsAccepted, 'to be undefined');

            state = new CompleteState({ accept: true });
            expect(state.isPermissionsAccepted, 'to be true');

            state = new CompleteState({ accept: false });
            expect(state.isPermissionsAccepted, 'to be false');
        });

        it('should run oAuthComplete passing accept: true', () => {
            const expected = { accept: true };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            mock.expects('run')
                .once()
                .withExactArgs('oAuthComplete', sinon.match(expected))
                .returns({ then() {} });

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: false', () => {
            const expected = { accept: false };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match(expected)).returns({
                then() {},
            });

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: true, while acceptRequired: true', () => {
            // acceptRequired may block user accept/decline actions, so we need
            // to check that they are accessible
            const expected = { accept: true };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                        acceptRequired: true,
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match(expected)).returns({
                then() {},
            });

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: false, while acceptRequired: true', () => {
            // acceptRequired may block user accept/decline actions, so we need
            // to check that they are accessible
            const expected = { accept: false };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isActive: true,
                    isGuest: false,
                },
                auth: {
                    oauth: {
                        clientId: 'ely.by',
                        prompt: [],
                        acceptRequired: true,
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match(expected)).returns({
                then() {},
            });

            state.enter(context);
        });
    });
});
