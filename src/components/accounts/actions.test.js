import expect from 'unexpected';
import sinon from 'sinon';

import { browserHistory } from 'services/history';

import { InternalServerError } from 'services/request';
import { sessionStorage } from 'services/localStorage';
import authentication from 'services/api/authentication';
import {
    authenticate,
    revoke,
    logoutAll,
    logoutStrangers
} from 'components/accounts/actions';
import {
    add, ADD,
    activate, ACTIVATE,
    remove,
    reset
} from 'components/accounts/actions/pure-actions';
import { SET_LOCALE } from 'components/i18n/actions';

import { updateUser, setUser } from 'components/user/actions';
import { setLogin, setAccountSwitcher } from 'components/auth/actions';

const account = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    token: 'foo',
    refreshToken: 'bar'
};

const user = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    lang: 'be'
};

describe('components/accounts/actions', () => {
    let dispatch;
    let getState;

    beforeEach(() => {
        dispatch = sinon.spy((arg) =>
            typeof arg === 'function' ? arg(dispatch, getState) : arg
        ).named('store.dispatch');
        getState = sinon.stub().named('store.getState');

        getState.returns({
            accounts: {
                available: [],
                active: null
            },
            auth: {
                credentials: {},
            },
            user: {},
        });

        sinon.stub(authentication, 'validateToken').named('authentication.validateToken');
        sinon.stub(browserHistory, 'push').named('browserHistory.push');
        sinon.stub(authentication, 'logout').named('authentication.logout');

        authentication.logout.returns(Promise.resolve());
        authentication.validateToken.returns(Promise.resolve({
            token: account.token,
            refreshToken: account.refreshToken,
            user
        }));
    });

    afterEach(() => {
        authentication.validateToken.restore();
        authentication.logout.restore();
        browserHistory.push.restore();
    });

    describe('#authenticate()', () => {
        it('should request user state using token', () =>
            authenticate(account)(dispatch, getState).then(() =>
                expect(authentication.validateToken, 'to have a call satisfying', [
                    {token: account.token, refreshToken: account.refreshToken}
                ])
            )
        );

        it(`dispatches ${ADD} action`, () =>
            authenticate(account)(dispatch, getState).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    add(account)
                ])
            )
        );

        it(`dispatches ${ACTIVATE} action`, () =>
            authenticate(account)(dispatch, getState).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    activate(account)
                ])
            )
        );

        it(`dispatches ${SET_LOCALE} action`, () =>
            authenticate(account)(dispatch, getState).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    {type: SET_LOCALE, payload: {locale: 'be'}}
                ])
            )
        );

        it('should update user state', () =>
            authenticate(account)(dispatch, getState).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    updateUser({...user, isGuest: false})
                ])
            )
        );

        it('resolves with account', () =>
            authenticate(account)(dispatch, getState).then((resp) =>
                expect(resp, 'to equal', account)
            )
        );

        it('rejects when bad auth data', () => {
            authentication.validateToken.returns(Promise.reject({}));

            return expect(authenticate(account)(dispatch, getState), 'to be rejected')
                .then(() => {
                    expect(dispatch, 'to have a call satisfying', [
                        setLogin(account.email)
                    ]);

                    expect(browserHistory.push, 'to have a call satisfying', [
                        '/login'
                    ]);
                });
        });

        it('rejects when 5xx without logouting', () => {
            const resp = new InternalServerError(null, {status: 500});

            authentication.validateToken.returns(Promise.reject(resp));

            return expect(authenticate(account)(dispatch, getState), 'to be rejected with', resp)
                .then(() => expect(dispatch, 'to have no calls satisfying', [
                    {payload: {isGuest: true}},
                ]));
        });

        it('marks user as stranger, if there is no refreshToken', () => {
            const expectedKey = `stranger${account.id}`;
            authentication.validateToken.returns(Promise.resolve({
                token: account.token,
                user
            }));

            sessionStorage.removeItem(expectedKey);

            return authenticate(account)(dispatch, getState).then(() => {
                expect(sessionStorage.getItem(expectedKey), 'not to be null');
                sessionStorage.removeItem(expectedKey);
            });
        });

        describe('when user authenticated during oauth', () => {
            beforeEach(() => {
                getState.returns({
                    accounts: {
                        available: [],
                        active: null
                    },
                    user: {},
                    auth: {
                        oauth: {
                            clientId: 'ely.by',
                            prompt: []
                        }
                    }
                });
            });

            it('should dispatch setAccountSwitcher', () =>
                authenticate(account)(dispatch, getState).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        setAccountSwitcher(false)
                    ])
                )
            );
        });

        describe('when one account available', () => {
            beforeEach(() => {
                getState.returns({
                    accounts: {
                        active: account.id,
                        available: [account]
                    },
                    auth: {
                        credentials: {},
                    },
                    user,
                });
            });

            it('should activate account before auth api call', () => {
                authentication.validateToken.returns(Promise.reject({ error: 'foo'}));

                return expect(
                    authenticate(account)(dispatch, getState),
                    'to be rejected with',
                    { error: 'foo'}
                ).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        activate(account)
                    ])
                );
            });
        });
    });

    describe('#revoke()', () => {
        describe('when one account available', () => {
            beforeEach(() => {
                getState.returns({
                    accounts: {
                        active: account.id,
                        available: [account]
                    },
                    auth: {
                        credentials: {},
                    },
                    user,
                });
            });

            it('should dispatch reset action', () =>
                revoke(account)(dispatch, getState).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        reset()
                    ])
                )
            );

            it('should call logout api method in background', () =>
                revoke(account)(dispatch, getState).then(() =>
                    expect(authentication.logout, 'to have a call satisfying', [
                        account
                    ])
                )
            );

            it('should update user state', () =>
                revoke(account)(dispatch, getState).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        setUser({isGuest: true})
                    ])
                    // expect(dispatch, 'to have calls satisfying', [
                    //     [remove(account)],
                    //     [expect.it('to be a function')]
                    //     // [logout()] // TODO: this is not a plain action. How should we simplify its testing?
                    // ])
                )
            );
        });

        describe('when multiple accounts available', () => {
            const account2 = {...account, id: 2};

            beforeEach(() => {
                getState.returns({
                    accounts: {
                        active: account2.id,
                        available: [account, account2]
                    },
                    user
                });
            });

            it('should switch to the next account', () =>
                revoke(account2)(dispatch, getState).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        activate(account)
                    ])
                )
            );

            it('should remove current account', () =>
                revoke(account2)(dispatch, getState).then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        remove(account2)
                    ])
                )
            );

            it('should call logout api method in background', () =>
                revoke(account2)(dispatch, getState).then(() =>
                    expect(authentication.logout, 'to have a call satisfying', [
                        account2
                    ])
                )
            );
        });
    });

    describe('#logoutAll()', () => {
        const account2 = {...account, id: 2};

        beforeEach(() => {
            getState.returns({
                accounts: {
                    active: account2.id,
                    available: [account, account2]
                },
                auth: {
                    credentials: {},
                },
                user,
            });
        });

        it('should call logout api method for each account', () => {
            logoutAll()(dispatch, getState);

            expect(authentication.logout, 'to have calls satisfying', [
                [account],
                [account2]
            ]);
        });

        it('should dispatch reset', () => {
            logoutAll()(dispatch, getState);

            expect(dispatch, 'to have a call satisfying', [
                reset()
            ]);
        });

        it('should redirect to /login', () =>
            logoutAll()(dispatch, getState).then(() => {
                expect(browserHistory.push, 'to have a call satisfying', [
                    '/login'
                ]);
            })
        );

        it('should change user to guest', () =>
            logoutAll()(dispatch, getState).then(() => {
                expect(dispatch, 'to have a call satisfying', [
                    setUser({
                        lang: user.lang,
                        isGuest: true
                    })
                ]);
            })
        );
    });

    describe('#logoutStrangers', () => {
        const foreignAccount = {
            ...account,
            id: 2,
            refreshToken: undefined
        };

        const foreignAccount2 = {
            ...foreignAccount,
            id: 3
        };

        beforeEach(() => {
            getState.returns({
                accounts: {
                    active: foreignAccount.id,
                    available: [account, foreignAccount, foreignAccount2]
                },
                user,
            });
        });

        it('should remove stranger accounts', () => {
            logoutStrangers()(dispatch, getState);

            expect(dispatch, 'to have a call satisfying', [
                remove(foreignAccount)
            ]);
            expect(dispatch, 'to have a call satisfying', [
                remove(foreignAccount2)
            ]);
        });

        it('should logout stranger accounts', () => {
            logoutStrangers()(dispatch, getState);

            expect(authentication.logout, 'to have calls satisfying', [
                [foreignAccount],
                [foreignAccount2]
            ]);
        });

        it('should activate another account if available', () =>
            logoutStrangers()(dispatch, getState)
                .then(() =>
                    expect(dispatch, 'to have a call satisfying', [
                        activate(account)
                    ])
                )
        );

        it('should not activate another account if active account is already not a stranger', () => {
            getState.returns({
                accounts: {
                    active: account.id,
                    available: [account, foreignAccount]
                },
                user
            });

            return logoutStrangers()(dispatch, getState)
                .then(() =>
                    expect(dispatch, 'was always called with',
                        expect.it('not to satisfy', activate(account)))
                );
        });

        it('should not dispatch if no strangers', () => {
            getState.returns({
                accounts: {
                    active: account.id,
                    available: [account]
                },
                user
            });

            return logoutStrangers()(dispatch, getState)
                .then(() =>
                    expect(dispatch, 'was not called')
                );
        });

        describe('when all accounts are strangers', () => {
            beforeEach(() => {
                getState.returns({
                    accounts: {
                        active: foreignAccount.id,
                        available: [foreignAccount, foreignAccount2]
                    },
                    auth: {
                        credentials: {},
                    },
                    user,
                });

                logoutStrangers()(dispatch, getState);
            });

            it('logouts all accounts', () => {
                expect(authentication.logout, 'to have calls satisfying', [
                    [foreignAccount],
                    [foreignAccount2],
                ]);

                expect(dispatch, 'to have a call satisfying', [
                    setUser({isGuest: true})
                ]);

                expect(dispatch, 'to have a call satisfying', [
                    reset()
                ]);
            });
        });

        describe('when a stranger has a mark in sessionStorage', () => {
            const key = `stranger${foreignAccount.id}`;

            beforeEach(() => {
                sessionStorage.setItem(key, 1);

                logoutStrangers()(dispatch, getState);
            });

            afterEach(() => {
                sessionStorage.removeItem(key);
            });

            it('should not log out', () =>
                expect(dispatch, 'was always called with',
                    expect.it('not to equal', {payload: foreignAccount})
                )
            );
        });
    });
});
