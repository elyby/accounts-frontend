import expect from 'unexpected';

import accounts from 'components/accounts/reducer';
import {
    updateToken, add, remove, activate,
    ADD, REMOVE, ACTIVATE, UPDATE_TOKEN
} from 'components/accounts/actions';

const account = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    token: 'foo',
    refreshToken: 'foo'
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
                active: account
            });
        });
    });

    describe(ADD, () => {
        it('adds an account', () =>
            expect(accounts(initial, add(account)), 'to satisfy', {
                available: [account]
            })
        );

        it('should not add the same account twice', () =>
            expect(accounts({...initial, available: [account]}, add(account)), 'to satisfy', {
                available: [account]
            })
        );

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

    describe(UPDATE_TOKEN, () => {
        it('should update token', () => {
            const newToken = 'newToken';

            expect(accounts(
                {active: account, available: [account]},
                updateToken(newToken)
            ), 'to satisfy', {
                active: {
                    ...account,
                    token: newToken
                },
                available: [account]
            });
        });
    });
});
