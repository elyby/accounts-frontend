import expect from 'test/unexpected';

import accounts from 'components/accounts/reducer';
import {
    updateToken
} from 'components/accounts/actions';
import {
    add, remove, activate, reset,
    ADD, REMOVE, ACTIVATE, UPDATE_TOKEN, RESET
} from 'components/accounts/actions/pure-actions';

const account = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    token: 'foo'
};

describe('Accounts reducer', () => {
    let initial;

    beforeEach(() => {
        initial = accounts(undefined, {});
    });

    it('should be empty', () => expect(accounts(undefined, {}), 'to equal', {
        active: null,
        available: []
    }));

    it('should return last state if unsupported action', () =>
        expect(accounts({state: 'foo'}, {}), 'to equal', {state: 'foo'})
    );

    describe(ACTIVATE, () => {
        it('sets active account', () => {
            expect(accounts(initial, activate(account)), 'to satisfy', {
                active: account.id
            });
        });
    });

    describe(ADD, () => {
        it('adds an account', () =>
            expect(accounts(initial, add(account)), 'to satisfy', {
                available: [account]
            })
        );

        it('should replace if account was added for the second time', () => {
            const outdatedAccount = {
                ...account,
                someShit: true
            };

            const updatedAccount = {
                ...account,
                token: 'newToken'
            };

            expect(
                accounts({...initial, available: [outdatedAccount]}, add(updatedAccount)),
                'to satisfy', {
                    available: [updatedAccount]
                });
        });

        it('should sort accounts by username', () => {
            const newAccount = {
                ...account,
                id: 2,
                username: 'abc'
            };

            expect(accounts({...initial, available: [account]}, add(newAccount)),
                'to satisfy', {
                    available: [newAccount, account]
                });
        });

        it('throws, when account is invalid', () => {
            expect(() => accounts(initial, add()),
                'to throw', 'Invalid or empty payload passed for accounts.add');
        });
    });

    describe(REMOVE, () => {
        it('should remove an account', () =>
            expect(accounts({...initial, available: [account]}, remove(account)),
                'to equal', initial)
        );

        it('throws, when account is invalid', () => {
            expect(() => accounts(initial, remove()),
                'to throw', 'Invalid or empty payload passed for accounts.remove');
        });
    });

    describe(RESET, () => {
        it('should reset accounts state', () =>
            expect(accounts({...initial, available: [account]}, reset()),
                'to equal', initial)
        );
    });

    describe(UPDATE_TOKEN, () => {
        it('should update token', () => {
            const newToken = 'newToken';

            expect(accounts(
                {active: account.id, available: [account]},
                updateToken(newToken)
            ), 'to satisfy', {
                active: account.id,
                available: [{
                    ...account,
                    token: newToken
                }]
            });
        });
    });
});
