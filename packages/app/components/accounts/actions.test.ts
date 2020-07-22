import expect from 'app/test/unexpected';
import sinon from 'sinon';
import { browserHistory } from 'app/services/history';
import { InternalServerError } from 'app/services/request';
import { sessionStorage } from 'app/services/localStorage';
import * as authentication from 'app/services/api/authentication';
import { authenticate, revoke, logoutAll, logoutStrangers } from 'app/components/accounts/actions';
import { add, activate, remove, reset } from 'app/components/accounts/actions/pure-actions';
import { updateUser, setUser } from 'app/components/user/actions';
import { setLogin, setAccountSwitcher } from 'app/components/auth/actions';
import { Dispatch, State as RootState } from 'app/types';

import { Account } from './reducer';

jest.mock('app/i18n', () => ({
    en: {
        code: 'en',
        name: 'English',
        englishName: 'English',
        progress: 100,
        isReleased: true,
    },
    be: {
        code: 'be',
        name: 'Беларуская',
        englishName: 'Belarusian',
        progress: 97,
        isReleased: true,
    },
}));

const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlbHl8MSJ9.pRJ7vakt2eIscjqwG__KhSxKb3qwGsdBBeDbBffJs_I';
const legacyToken = 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOjF9.cRF-sQNrwWQ94xCb3vWioVdjxAZeefEE7GMGwh7708o';

const account = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    token,
    refreshToken: 'bar',
};

const user = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    lang: 'be',
};

describe('components/accounts/actions', () => {
    let dispatch: Dispatch;
    let getState: () => RootState;

    beforeEach(() => {
        dispatch = sinon
            .spy((arg) => (typeof arg === 'function' ? arg(dispatch, getState) : arg))
            .named('store.dispatch');
        getState = sinon.stub().named('store.getState');

        (getState as any).returns({
            accounts: {
                available: [],
                active: null,
            },
            auth: {
                credentials: {},
            },
            user: {},
        });

        sinon.stub(authentication, 'validateToken').named('authentication.validateToken');
        sinon.stub(browserHistory, 'push').named('browserHistory.push');
        sinon.stub(authentication, 'logout').named('authentication.logout');

        (authentication.logout as any).returns(Promise.resolve());
        (authentication.validateToken as any).returns(
            Promise.resolve({
                token: account.token,
                refreshToken: account.refreshToken,
                user,
            }),
        );
    });

    afterEach(() => {
        (authentication.validateToken as any).restore();
        (authentication.logout as any).restore();
        (browserHistory.push as any).restore();
    });

    describe('#authenticate()', () => {
        it('should request user state using token', () =>
            authenticate(account)(dispatch, getState, undefined).then(() =>
                expect(authentication.validateToken, 'to have a call satisfying', [
                    account.id,
                    account.token,
                    account.refreshToken,
                ]),
            ));

        it('should request user by extracting id from token', () =>
            authenticate({ token } as Account)(dispatch, getState, undefined).then(() =>
                expect(authentication.validateToken, 'to have a call satisfying', [1, token, undefined]),
            ));

        it('should request user by extracting id from legacy token', () =>
            authenticate({ token: legacyToken } as Account)(dispatch, getState, undefined).then(() =>
                expect(authentication.validateToken, 'to have a call satisfying', [1, legacyToken, undefined]),
            ));

        it(`dispatches accounts:add action`, () =>
            authenticate(account)(dispatch, getState, undefined).then(() =>
                expect(dispatch, 'to have a call satisfying', [add(account)]),
            ));

        it(`dispatches accounts:activate action`, () =>
            authenticate(account)(dispatch, getState, undefined).then(() =>
                expect(dispatch, 'to have a call satisfying', [activate(account)]),
            ));

        it(`dispatches i18n:setLocale action`, () =>
            authenticate(account)(dispatch, getState, undefined).then(() =>
                expect(dispatch, 'to have a call satisfying', [{ type: 'i18n:setLocale', payload: { locale: 'be' } }]),
            ));

        it('should update user state', () =>
            authenticate(account)(dispatch, getState, undefined).then(() =>
                expect(dispatch, 'to have a call satisfying', [updateUser({ ...user, isGuest: false })]),
            ));

        it('resolves with account', () =>
            authenticate(account)(dispatch, getState, undefined).then((resp) => expect(resp, 'to equal', account)));

        it('rejects when bad auth data', () => {
            (authentication.validateToken as any).returns(Promise.reject({}));

            return expect(authenticate(account)(dispatch, getState, undefined), 'to be rejected').then(() => {
                expect(dispatch, 'to have a call satisfying', [setLogin(account.email)]);

                expect(browserHistory.push, 'to have a call satisfying', ['/login']);
            });
        });

        it('rejects when 5xx without logouting', () => {
            const resp = new InternalServerError('500', { status: 500 });

            (authentication.validateToken as any).rejects(resp);

            return expect(authenticate(account)(dispatch, getState, undefined), 'to be rejected with', resp).then(() =>
                expect(dispatch, 'to have no calls satisfying', [{ payload: { isGuest: true } }]),
            );
        });

        it('marks user as stranger, if there is no refreshToken', () => {
            const expectedKey = `stranger${account.id}`;
            (authentication.validateToken as any).resolves({
                token: account.token,
                user,
            });

            sessionStorage.removeItem(expectedKey);

            return authenticate(account)(dispatch, getState, undefined).then(() => {
                expect(sessionStorage.getItem(expectedKey), 'not to be null');
                sessionStorage.removeItem(expectedKey);
            });
        });

        describe('when user authenticated during oauth', () => {
            beforeEach(() => {
                (getState as any).returns({
                    accounts: {
                        available: [],
                        active: null,
                    },
                    user: {},
                    auth: {
                        oauth: {
                            clientId: 'ely.by',
                            prompt: [],
                        },
                    },
                });
            });

            it('should dispatch setAccountSwitcher', () =>
                authenticate(account)(dispatch, getState, undefined).then(() =>
                    expect(dispatch, 'to have a call satisfying', [setAccountSwitcher(false)]),
                ));
        });

        describe('when one account available', () => {
            beforeEach(() => {
                (getState as any).returns({
                    accounts: {
                        active: account.id,
                        available: [account],
                    },
                    auth: {
                        credentials: {},
                    },
                    user,
                });
            });

            it('should activate account before auth api call', () => {
                (authentication.validateToken as any).returns(Promise.reject({ error: 'foo' }));

                return expect(authenticate(account)(dispatch, getState, undefined), 'to be rejected with', {
                    error: 'foo',
                }).then(() => expect(dispatch, 'to have a call satisfying', [activate(account)]));
            });
        });
    });

    describe('#revoke()', () => {
        describe('when one account available', () => {
            beforeEach(() => {
                (getState as any).returns({
                    accounts: {
                        active: account.id,
                        available: [account],
                    },
                    auth: {
                        credentials: {},
                    },
                    user,
                });
            });

            it('should dispatch reset action', () =>
                revoke(account)(dispatch, getState, undefined).then(() =>
                    expect(dispatch, 'to have a call satisfying', [reset()]),
                ));

            it('should call logout api method in background', () =>
                revoke(account)(dispatch, getState, undefined).then(() =>
                    expect(authentication.logout, 'to have a call satisfying', [account.token]),
                ));

            it('should update user state', () =>
                revoke(account)(dispatch, getState, undefined).then(
                    () => expect(dispatch, 'to have a call satisfying', [setUser({ isGuest: true })]),
                    // expect(dispatch, 'to have calls satisfying', [
                    //     [remove(account)],
                    //     [expect.it('to be a function')]
                    //     // [logout()] // TODO: this is not a plain action. How should we simplify its testing?
                    // ])
                ));
        });

        describe('when multiple accounts available', () => {
            const account2 = { ...account, id: 2 };

            beforeEach(() => {
                (getState as any).returns({
                    accounts: {
                        active: account2.id,
                        available: [account, account2],
                    },
                    user,
                });
            });

            it('should switch to the next account', () =>
                revoke(account2)(dispatch, getState, undefined).then(() =>
                    expect(dispatch, 'to have a call satisfying', [activate(account)]),
                ));

            it('should remove current account', () =>
                revoke(account2)(dispatch, getState, undefined).then(() =>
                    expect(dispatch, 'to have a call satisfying', [remove(account2)]),
                ));

            it('should call logout api method in background', () =>
                revoke(account2)(dispatch, getState, undefined).then(() =>
                    expect(authentication.logout, 'to have a call satisfying', [account2.token]),
                ));
        });
    });

    describe('#logoutAll()', () => {
        const account2 = { ...account, id: 2 };

        beforeEach(() => {
            (getState as any).returns({
                accounts: {
                    active: account2.id,
                    available: [account, account2],
                },
                auth: {
                    credentials: {},
                },
                user,
            });
        });

        it('should call logout api method for each account', () => {
            logoutAll()(dispatch, getState, undefined);

            expect(authentication.logout, 'to have calls satisfying', [[account.token], [account2.token]]);
        });

        it('should dispatch reset', () => {
            logoutAll()(dispatch, getState, undefined);

            expect(dispatch, 'to have a call satisfying', [reset()]);
        });

        it('should redirect to /login', () =>
            logoutAll()(dispatch, getState, undefined).then(() => {
                expect(browserHistory.push, 'to have a call satisfying', ['/login']);
            }));

        it('should change user to guest', () =>
            logoutAll()(dispatch, getState, undefined).then(() => {
                expect(dispatch, 'to have a call satisfying', [
                    setUser({
                        lang: user.lang,
                        isGuest: true,
                    }),
                ]);
            }));
    });

    describe('#logoutStrangers', () => {
        const foreignAccount = {
            ...account,
            id: 2,
            refreshToken: null,
        };

        const foreignAccount2 = {
            ...foreignAccount,
            id: 3,
        };

        beforeEach(() => {
            (getState as any).returns({
                accounts: {
                    active: foreignAccount.id,
                    available: [account, foreignAccount, foreignAccount2],
                },
                user,
            });
        });

        it('should remove stranger accounts', () => {
            logoutStrangers()(dispatch, getState, undefined);

            expect(dispatch, 'to have a call satisfying', [remove(foreignAccount)]);
            expect(dispatch, 'to have a call satisfying', [remove(foreignAccount2)]);
        });

        it('should logout stranger accounts', () => {
            logoutStrangers()(dispatch, getState, undefined);

            expect(authentication.logout, 'to have calls satisfying', [
                [foreignAccount.token],
                [foreignAccount2.token],
            ]);
        });

        it('should activate another account if available', () =>
            logoutStrangers()(dispatch, getState, undefined).then(() =>
                expect(dispatch, 'to have a call satisfying', [activate(account)]),
            ));

        it('should not activate another account if active account is already not a stranger', () => {
            (getState as any).returns({
                accounts: {
                    active: account.id,
                    available: [account, foreignAccount],
                },
                user,
            });

            return logoutStrangers()(dispatch, getState, undefined).then(() =>
                expect(dispatch, 'not to have calls satisfying', [activate(account)]),
            );
        });

        it('should not dispatch if no strangers', () => {
            (getState as any).returns({
                accounts: {
                    active: account.id,
                    available: [account],
                },
                user,
            });

            return logoutStrangers()(dispatch, getState, undefined).then(() => expect(dispatch, 'was not called'));
        });

        describe('when all accounts are strangers', () => {
            beforeEach(() => {
                (getState as any).returns({
                    accounts: {
                        active: foreignAccount.id,
                        available: [foreignAccount, foreignAccount2],
                    },
                    auth: {
                        credentials: {},
                    },
                    user,
                });

                logoutStrangers()(dispatch, getState, undefined);
            });

            it('logouts all accounts', () => {
                expect(authentication.logout, 'to have calls satisfying', [
                    [foreignAccount.token],
                    [foreignAccount2.token],
                ]);

                expect(dispatch, 'to have a call satisfying', [setUser({ isGuest: true })]);

                expect(dispatch, 'to have a call satisfying', [reset()]);
            });
        });

        describe('when a stranger has a mark in sessionStorage', () => {
            const key = `stranger${foreignAccount.id}`;

            beforeEach(() => {
                sessionStorage.setItem(key, '1');

                logoutStrangers()(dispatch, getState, undefined);
            });

            afterEach(() => {
                sessionStorage.removeItem(key);
            });

            it('should not log out', () =>
                expect(dispatch, 'not to have calls satisfying', [{ payload: foreignAccount }]));
        });
    });
});
