import expect from 'unexpected';

import accounts from 'services/api/accounts';
import { authenticate, revoke, add, activate, remove, ADD, REMOVE, ACTIVATE } from 'components/accounts/actions';

import { updateUser, logout } from 'components/user/actions';

const account = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    token: 'foo',
    refreshToken: 'foo'
};

const user = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
};

describe('Accounts actions', () => {
    let dispatch;
    let getState;

    beforeEach(() => {
        dispatch = sinon.spy(function dispatch(arg) {
            return typeof arg === 'function' ? arg(dispatch, getState) : arg;
        }).named('dispatch');
        getState = sinon.stub().named('getState');

        getState.returns({
            accounts: [],
            user: {}
        });

        sinon.stub(accounts, 'current').named('accounts.current');
        accounts.current.returns(Promise.resolve(user));
    });

    afterEach(() => {
        accounts.current.restore();
    });

    describe('#authenticate()', () => {
        it('should request user state using token', () => {
            authenticate(account)(dispatch);

            expect(accounts.current, 'to have a call satisfying', [
                {token: account.token}
            ]);
        });

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

        it('should update user state', () =>
            authenticate(account)(dispatch).then(() =>
                expect(dispatch, 'to have a call satisfying', [
                    updateUser(user)
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

            const promise = authenticate(account)(dispatch);

            expect(promise, 'to be rejected');

            return promise.catch(() => {
                expect(dispatch, 'was not called');
                return Promise.resolve();
            });
        });
    });

    describe('#revoke()', () => {
        it(`should dispatch ${REMOVE} action`, () => {
            revoke(account)(dispatch, getState);

            expect(dispatch, 'to have a call satisfying', [
                remove(account)
            ]);
        });

        it('should switch next account if available', () => {
            const account2 = {...account, id: 2};

            getState.returns({
                accounts: [account2]
            });

            return revoke(account)(dispatch, getState).then(() =>
                expect(dispatch, 'to have calls satisfying', [
                    [remove(account)],
                    [expect.it('to be a function')]
                    // [authenticate(account2)] // TODO: this is not a plain action. How should we simplify its testing?
                ])
            );
        });

        it('should logout if no other accounts available', () => {
            revoke(account)(dispatch, getState)
                .then(() =>
                    expect(dispatch, 'to have calls satisfying', [
                        [remove(account)],
                        [expect.it('to be a function')]
                        // [logout()] // TODO: this is not a plain action. How should we simplify its testing?
                    ])
                );
        });
    });
});
