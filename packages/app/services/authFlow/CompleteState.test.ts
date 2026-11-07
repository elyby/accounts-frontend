import expect from 'app/test/unexpected';
import sinon, { SinonMock } from 'sinon';
import { SynchronousPromise } from 'synchronous-promise';

import CompleteState from 'app/services/authFlow/CompleteState';
import LoginState from 'app/services/authFlow/LoginState';
import ActivationState from 'app/services/authFlow/ActivationState';
import AcceptRulesState from 'app/services/authFlow/AcceptRulesState';
import FinishState from 'app/services/authFlow/FinishState';
import PermissionsState from 'app/services/authFlow/PermissionsState';
import ChooseAccountState from 'app/services/authFlow/ChooseAccountState';
import PasswordState from 'app/services/authFlow/PasswordState';
import { Account } from 'app/components/accounts/reducer';
import { OAuthError, UnauthorizedError } from 'app/services/request';
import AbstractState from './AbstractState';

import { bootstrap, expectState, expectNavigate, expectRun, MockedAuthContext } from './helpers';

describe('CompleteState', () => {
    let state: CompleteState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    beforeEach(() => {
        state = new CompleteState();

        const data = bootstrap();
        ({ context, mock } = data);
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to / for authenticated', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                },
            });

            expectNavigate(mock, '/');

            state.enter(context);
        });

        it('should transition to login for guests', () => {
            context.getState.returns({
                user: {
                    isGuest: true,
                },
                auth: {
                    credentials: {},
                },
            });

            expectState(mock, LoginState);

            state.enter(context);
        });

        it('should transition to activation if account is not activated', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {
                        isActivationRequired: true,
                    },
                },
            });

            expectState(mock, ActivationState);

            state.enter(context);
        });

        it('should navigate to the / if account is deleted', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                    shouldAcceptRules: true,
                    isDeleted: true,
                },
                auth: {
                    credentials: {},
                },
            });

            expectNavigate(mock, '/');

            state.enter(context);
        });

        it('should transition to accept-rules if shouldAcceptRules', () => {
            context.getState.returns({
                user: {
                    shouldAcceptRules: true,
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                },
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
                auth: {
                    credentials: {
                        isActivationRequired: true,
                    },
                },
            });

            expectState(mock, ActivationState);

            state.enter(context);
        });

        describe('oauth', () => {

            describe('permissions', () => {
                it('should transition to permissions state if acceptRequired', () => {
                    context.getState.returns({
                        user: {
                            isGuest: false,
                        },
                        auth: {
                            credentials: {},
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
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
                            isGuest: false,
                        },
                        auth: {
                            credentials: {},
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: ['consent'],
                            },
                        },
                    });

                    expectState(mock, PermissionsState);

                    state.enter(context);
                });
            });

            describe('account switcher', () => {
                it('should transition to ChooseAccountState if user has multiple accs and switcher enabled', () => {
                    context.getState.returns({
                        user: {
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }, { id: 2 }],
                            active: 1,
                        },
                        auth: {
                            credentials: {},
                            isSwitcherEnabled: true,
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: [],
                            },
                        },
                    });

                    expectState(mock, ChooseAccountState);

                    state.enter(context);
                });

                it('should transition to ChooseAccountState if user has a single acc and switcher enabled', () => {
                    context.getState.returns({
                        user: {
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }],
                            active: 1,
                        },
                        auth: {
                            credentials: {},
                            isSwitcherEnabled: true,
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: [],
                            },
                        },
                    });

                    expectState(mock, ChooseAccountState);

                    state.enter(context);
                });

                it('should NOT transition to ChooseAccountState if prompt=skip_account_selection', () => {
                    context.getState.returns({
                        user: {
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }, { id: 2 }],
                            active: 1,
                        },
                        auth: {
                            credentials: {},
                            isSwitcherEnabled: true,
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: ['skip_account_selection'],
                            },
                        },
                    });

                    expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve());

                    state.enter(context);
                });


                it('should transition to ChooseAccountState if both prompt=select_account and skip_account_selection', () => {
                    context.getState.returns({
                        user: {
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }],
                            active: 1,
                        },
                        auth: {
                            credentials: {},
                            isSwitcherEnabled: true,
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: ['skip_account_selection', 'select_account'],
                            },
                        },
                    });

                    expectState(mock, ChooseAccountState);

                    state.enter(context);
                });

                it('should transition to ChooseAccountState if user isDeleted', () => {
                    context.getState.returns({
                        user: {
                            isDeleted: true,
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }],
                            active: 1,
                        },
                        auth: {
                            isSwitcherEnabled: true,
                            credentials: {},
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
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
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }, { id: 2 }],
                            active: 1,
                        },
                        auth: {
                            isSwitcherEnabled: false,
                            credentials: {},
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: [],
                            },
                        },
                    });

                    expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve());

                    state.enter(context);
                });

                it('should transition to ChooseAccountState if prompt=select_account and switcher enabled', () => {
                    context.getState.returns({
                        user: {
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }],
                            active: 1,
                        },
                        auth: {
                            isSwitcherEnabled: true,
                            credentials: {},
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
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
                            isGuest: false,
                        },
                        accounts: {
                            available: [{ id: 1 }],
                            active: 1,
                        },
                        auth: {
                            isSwitcherEnabled: false,
                            credentials: {},
                            oauth: {
                                params: {
                                    clientId: 'ely.by',
                                },
                                prompt: ['select_account'],
                            },
                        },
                    });

                    expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve());

                    state.enter(context);
                });
            });
        });
    });

    describe('when user completes oauth', () => {
        it('should run oAuthComplete', () => {
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match.object).returns(Promise.resolve());

            state.enter(context);
        });

        it('should run redirect by default', () => {
            const expectedUrl = 'foo/bar';
            const promise = Promise.resolve({ redirectUri: expectedUrl });

            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
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
            const promise = SynchronousPromise[type](resp);

            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match.object).returns(promise);
            expectState(mock, expectedInstance);

            state.enter(context);

            return promise.catch(mock.verify.bind(mock));
        };

        it('should transition to finish state if resolved without redirect uri', () =>
            testOAuth('resolve', { success: true }, FinishState));

        it('should transition to login state if rejected with unauthorized', () =>
            testOAuth(
                'reject',
                new UnauthorizedError(new Response('{}', { status: 401 }), { name: 'Unauthorized', status: 401 }),
                LoginState,
            ));

        it('should transition to permissions state if rejected with acceptRequired', () =>
            testOAuth(
                'reject',
                new OAuthError(new Response('{}', { status: 401 }), { error: 'accept_required' }),
                PermissionsState,
            ));

        describe('when loginHint is set', () => {
            const testSuccessLoginHint = (field: keyof Account) => {
                const account: Account = {
                    id: 9,
                    email: 'some@email.com',
                    username: 'thatUsername',
                    token: '',
                    refreshToken: '',
                    isDeleted: false,
                };

                context.getState.returns({
                    user: {
                        isGuest: false,
                    },
                    accounts: {
                        available: [account],
                        active: 100,
                    },
                    auth: {
                        credentials: {},
                        oauth: {
                            params: {
                                clientId: 'ely.by',
                            },
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
                        isGuest: false,
                    },
                    accounts: {
                        available: [account],
                        active: account.id,
                    },
                    auth: {
                        credentials: {},
                        oauth: {
                            params: {
                                clientId: 'ely.by',
                            },
                            loginHint: account.id,
                            prompt: [],
                        },
                    },
                });

                expectRun(mock, 'setAccountSwitcher', false);
                expectRun(mock, 'oAuthComplete', {}).returns(SynchronousPromise.resolve());

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
                        isGuest: false,
                    },
                    accounts: {
                        available: [{ id: 1 }],
                        active: 1,
                    },
                    auth: {
                        credentials: {},
                        oauth: {
                            params: {
                                clientId: 'ely.by',
                            },
                            loginHint: account.id,
                            prompt: [],
                        },
                    },
                });

                expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve());

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
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
                        prompt: [],
                    },
                },
            });

            mock.expects('run').once().withExactArgs('oAuthComplete', sinon.match(expected)).returns(Promise.resolve());

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: false', () => {
            const expected = { accept: false };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
                        prompt: [],
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match(expected)).returns(Promise.resolve());

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: true, while acceptRequired: true', () => {
            // acceptRequired may block user accept/decline actions, so we need
            // to check that they are accessible
            const expected = { accept: true };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
                        prompt: [],
                        acceptRequired: true,
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match(expected)).returns(Promise.resolve());

            state.enter(context);
        });

        it('should run oAuthComplete passing accept: false, while acceptRequired: true', () => {
            // acceptRequired may block user accept/decline actions, so we need
            // to check that they are accessible
            const expected = { accept: false };

            state = new CompleteState(expected);
            context.getState.returns({
                user: {
                    isGuest: false,
                },
                auth: {
                    credentials: {},
                    oauth: {
                        params: {
                            clientId: 'ely.by',
                        },
                        prompt: [],
                        acceptRequired: true,
                    },
                },
            });

            expectRun(mock, 'oAuthComplete', sinon.match(expected)).returns(Promise.resolve());

            state.enter(context);
        });
    });

    describe('forced login (prompt=login)', () => {
        function getState(oauth: Record<string, any> = {}) {
            return {
                user: { isGuest: false },
                accounts: { available: [{ id: 1, email: 'foo@ely.by' }], active: 1 },
                auth: {
                    credentials: {},
                    isSwitcherEnabled: false,
                    oauth: { params: { query: {} }, prompt: ['login'], ...oauth },
                },
            };
        }

        it('should ask the logged in user to enter the password again', () => {
            context.getState.returns(getState());
            expectRun(mock, 'forceLogin', 'foo@ely.by');
            expectState(mock, PasswordState);

            state.enter(context);
        });

        it('should complete, when the user has already logged in during the request', async () => {
            context.getState.returns(getState({ isLoginPassed: true }));
            expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve({ redirectUri: 'https://example.com?code=1' }));
            expectRun(mock, 'redirect', 'https://example.com?code=1');

            await state.enter(context);
        });

        it('should show the account switcher before asking for the password', () => {
            context.getState.returns({ ...getState(), auth: { ...getState().auth, isSwitcherEnabled: true } });
            expectState(mock, ChooseAccountState);

            state.enter(context);
        });
    });

    describe('silent authorization (prompt=none)', () => {
        function getSilentState({
            user = {},
            credentials = {},
            oauth = {},
            accounts = { available: [{ id: 1 }], active: 1 },
        }: {
            user?: Record<string, any>;
            credentials?: Record<string, any>;
            oauth?: Record<string, any>;
            accounts?: Record<string, any>;
        } = {}) {
            return {
                user: { isGuest: false, ...user },
                accounts,
                auth: {
                    credentials,
                    isSwitcherEnabled: true,
                    oauth: { params: { query: {} }, prompt: ['none'], ...oauth },
                },
            };
        }

        // When there is no address to return the user to, the user stays on our side
        function expectRedirectError(error: string) {
            expectRun(mock, 'oAuthRedirectError', error).returns(Promise.resolve());
            expectNavigate(mock, '/');
        }

        it('should return invalid_request, when none is combined with other values', async () => {
            context.getState.returns(getSilentState({ oauth: { prompt: ['none', 'consent'] } }));
            expectRedirectError('invalid_request');

            await state.enter(context);
        });

        it('should return login_required for a guest', async () => {
            context.getState.returns(getSilentState({ user: { isGuest: true } }));
            expectRedirectError('login_required');

            await state.enter(context);
        });

        it('should return login_required, when the account activation is required', async () => {
            context.getState.returns(getSilentState({ credentials: { isActivationRequired: true } }));
            expectRedirectError('login_required');

            await state.enter(context);
        });

        it('should return interaction_required, when the rules must be accepted', async () => {
            context.getState.returns(getSilentState({ user: { shouldAcceptRules: true } }));
            expectRedirectError('interaction_required');

            await state.enter(context);
        });

        it('should return interaction_required for a deleted account', async () => {
            context.getState.returns(getSilentState({ user: { isDeleted: true } }));
            expectRedirectError('interaction_required');

            await state.enter(context);
        });

        it('should return login_required, when the login_hint account is not logged in', async () => {
            context.getState.returns(getSilentState({ oauth: { loginHint: 'unknown@ely.by' } }));
            expectRedirectError('login_required');

            await state.enter(context);
        });

        it('should return consent_required, when the permissions must be accepted', async () => {
            context.getState.returns(getSilentState({ oauth: { acceptRequired: true } }));
            expectRedirectError('consent_required');

            await state.enter(context);
        });

        it('should return account_selection_required, when the user has multiple accounts', async () => {
            context.getState.returns(getSilentState({ accounts: { available: [{ id: 1 }, { id: 2 }], active: 1 } }));
            expectRedirectError('account_selection_required');

            await state.enter(context);
        });

        it('should complete with the login_hint account, when the user has multiple accounts', async () => {
            context.getState.returns(
                getSilentState({
                    accounts: { available: [{ id: 1, email: 'foo@ely.by' }, { id: 2 }], active: 1 },
                    oauth: { loginHint: 'foo@ely.by' },
                }),
            );
            expectRun(mock, 'setAccountSwitcher', false);
            expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve({ redirectUri: 'https://example.com?code=1' }));
            expectRun(mock, 'redirect', 'https://example.com?code=1');

            await state.enter(context);
        });

        it('should not show the account switcher and complete with the single account', async () => {
            context.getState.returns(getSilentState());
            expectRun(mock, 'oAuthComplete', {}).returns(Promise.resolve({ redirectUri: 'https://example.com?code=1' }));
            expectRun(mock, 'redirect', 'https://example.com?code=1');

            await state.enter(context);
        });

        it('should return login_required, when the completion is rejected as unauthorized', async () => {
            context.getState.returns(getSilentState());
            expectRun(mock, 'oAuthComplete', {}).returns(
                Promise.reject(
                    new UnauthorizedError(new Response('{}', { status: 401 }), { name: 'Unauthorized', status: 401 }),
                ),
            );
            expectRedirectError('login_required');

            await state.enter(context);
        });

        it('should return consent_required, when the completion requires the permissions acceptance', async () => {
            context.getState.returns(getSilentState());
            expectRun(mock, 'oAuthComplete', {}).returns(
                Promise.reject(new OAuthError(new Response('{}', { status: 401 }), { error: 'accept_required' })),
            );
            expectRedirectError('consent_required');

            await state.enter(context);
        });

        it('should not navigate, while the user is being redirected to the client', () => {
            context.getState.returns(getSilentState({ user: { isGuest: true } }));
            // The redirect never resolves
            expectRun(mock, 'oAuthRedirectError', 'login_required').returns(new Promise(() => {}));

            state.enter(context);
        });
    });
});
