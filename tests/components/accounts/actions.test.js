import expect from 'unexpected';

import accounts from 'services/api/accounts';
import authentication from 'services/api/authentication';
import { authenticate, revoke, add, activate, remove, ADD, REMOVE, ACTIVATE } from 'components/accounts/actions';
import { SET_LOCALE } from 'components/i18n/actions';

import { updateUser } from 'components/user/actions';

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
            accounts: [],
            user: {}
        });

        sinon.stub(authentication, 'validateToken').named('authentication.validateToken');
        authentication.validateToken.returns(Promise.resolve({
            token: account.token,
            refreshToken: account.refreshToken
        }));

        sinon.stub(accounts, 'current').named('accounts.current');
        accounts.current.returns(Promise.resolve(user));
    });

    afterEach(() => {
        authentication.validateToken.restore();
        accounts.current.restore();
    });

    describe('#authenticate()', () => {
        it('should request user state using token', () =>
            authenticate(account)(dispatch).then(() =>
                expect(accounts.current, 'to have a call satisfying', [
                    {token: account.token}
                ])
            )
        );

        it(`dispatches ${ADD} action`, () =>
            authenticate(account)(dispatch).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    add(account)
                ])
            )
        );

        it(`dispatches ${ACTIVATE} action`, () =>
            authenticate(account)(dispatch).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    activate(account)
                ])
            )
        );

        it(`dispatches ${SET_LOCALE} action`, () =>
            authenticate(account)(dispatch).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    {type: SET_LOCALE, payload: {locale: 'be'}}
                ])
            )
        );

        it('should update user state', () =>
            authenticate(account)(dispatch).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    updateUser({...user, isGuest: false})
                ])
            )
        );

        it('resolves with account', () =>
            authenticate(account)(dispatch).then((resp) =>
                expect(resp, 'to equal', account)
            )
        );

        it('rejects when bad auth data', () => {
            accounts.current.returns(Promise.reject({}));

            return expect(authenticate(account)(dispatch), 'to be rejected').then(() =>
                expect(dispatch, 'was not called')
            );
        });
    });

    describe('#revoke()', () => {
        it('should switch next account if available', () => {
            const account2 = {...account, id: 2};

            getState.returns({
                accounts: {
                    active: account2,
                    available: [account]
                },
                user
            });

            return revoke(account2)(dispatch, getState).then(() => {
                expect(dispatch, 'to have a call satisfying', [
                    remove(account2)
                ]);
                expect(dispatch, 'to have a call satisfying', [
                    activate(account)
                ]);
                expect(dispatch, 'to have a call satisfying', [
                    updateUser({...user, isGuest: false})
                ]);
                // expect(dispatch, 'to have calls satisfying', [
                //     [remove(account2)],
                //     [expect.it('to be a function')]
                //     // [authenticate(account2)] // TODO: this is not a plain action. How should we simplify its testing?
                // ])
            });
        });

        it('should logout if no other accounts available', () => {
            getState.returns({
                accounts: {
                    active: account,
                    available: []
                },
                user
            });

            revoke(account)(dispatch, getState).then(() => {
                expect(dispatch, 'to have a call satisfying', [
                    {payload: {isGuest: true}}
                    // updateUser({isGuest: true})
                ]);
                // expect(dispatch, 'to have calls satisfying', [
                //     [remove(account)],
                //     [expect.it('to be a function')]
                //     // [logout()] // TODO: this is not a plain action. How should we simplify its testing?
                // ])
            });
        });
    });
});
