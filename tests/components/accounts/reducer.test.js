import expect from 'unexpected';

import accounts from 'components/accounts/reducer';
import { ADD, REMOVE, ACTIVATE } from 'components/accounts/actions';

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
        initial = accounts(null, {});
    });

    it('should be empty', () => expect(accounts(null, {}), 'to equal', {
        active: null,
        available: []
    }));

    describe(ACTIVATE, () => {
        it('sets active account', () => {
            expect(accounts(initial, {
                type: ACTIVATE,
                payload: account
            }), 'to satisfy', {
                active: account
            });
        });
    });

    describe(ADD, () => {
        it('adds an account', () =>
            expect(accounts(initial, {
                type: ADD,
                payload: account
            }), 'to satisfy', {
                available: [account]
            })
        );

        it('should not add the same account twice', () =>
            expect(accounts({...initial, available: [account]}, {
                type: ADD,
                payload: account
            }), 'to satisfy', {
                available: [account]
            })
        );

        it('throws, when account is invalid', () => {
            expect(() => accounts(initial, {
                type: ADD
            }), 'to throw', 'Invalid or empty payload passed for accounts.add');

            expect(() => accounts(initial, {
                type: ADD,
                payload: {}
            }), 'to throw', 'Invalid or empty payload passed for accounts.add');
        });
    });

    describe(REMOVE, () => {
        it('should remove an account', () =>
            expect(accounts({...initial, available: [account]}, {
                type: REMOVE,
                payload: account
            }), 'to equal', initial)
        );

        it('throws, when account is invalid', () => {
            expect(() => accounts(initial, {
                type: REMOVE
            }), 'to throw', 'Invalid or empty payload passed for accounts.remove');

            expect(() => accounts(initial, {
                type: REMOVE,
                payload: {}
            }), 'to throw', 'Invalid or empty payload passed for accounts.remove');
        });
    });
});
