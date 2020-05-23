import expect from 'app/test/unexpected';

import { updateToken } from './actions';
import { add, remove, activate, reset } from './actions/pure-actions';
import { AccountsState } from './index';
import accounts, { Account } from './reducer';

const account: Account = {
    id: 1,
    username: 'username',
    email: 'email@test.com',
    token: 'foo',
} as Account;

describe('Accounts reducer', () => {
    let initial: AccountsState;

    beforeEach(() => {
        initial = accounts(undefined, {} as any);
    });

    it('should be empty', () =>
        expect(accounts(undefined, {} as any), 'to equal', {
            active: null,
            available: [],
        }));

    it('should return last state if unsupported action', () =>
        expect(accounts({ state: 'foo' } as any, {} as any), 'to equal', {
            state: 'foo',
        }));

    describe('accounts:activate', () => {
        it('sets active account', () => {
            expect(accounts(initial, activate(account)), 'to satisfy', {
                active: account.id,
            });
        });
    });

    describe('accounts:add', () => {
        it('adds an account', () =>
            expect(accounts(initial, add(account)), 'to satisfy', {
                available: [account],
            }));

        it('should replace if account was added for the second time', () => {
            const outdatedAccount = {
                ...account,
                someShit: true,
            };

            const updatedAccount = {
                ...account,
                token: 'newToken',
            };

            expect(accounts({ ...initial, available: [outdatedAccount] }, add(updatedAccount)), 'to satisfy', {
                available: [updatedAccount],
            });
        });

        it('should sort accounts by username', () => {
            const newAccount = {
                ...account,
                id: 2,
                username: 'abc',
            };

            expect(accounts({ ...initial, available: [account] }, add(newAccount)), 'to satisfy', {
                available: [newAccount, account],
            });
        });

        it('throws, when account is invalid', () => {
            expect(
                () =>
                    accounts(
                        initial,
                        // @ts-ignore
                        add(),
                    ),
                'to throw',
                'Invalid or empty payload passed for accounts.add',
            );
        });
    });

    describe('accounts:remove', () => {
        it('should remove an account', () =>
            expect(accounts({ ...initial, available: [account] }, remove(account)), 'to equal', initial));

        it('throws, when account is invalid', () => {
            expect(
                () =>
                    accounts(
                        initial,
                        // @ts-ignore
                        remove(),
                    ),
                'to throw',
                'Invalid or empty payload passed for accounts.remove',
            );
        });
    });

    describe('actions:reset', () => {
        it('should reset accounts state', () =>
            expect(accounts({ ...initial, available: [account] }, reset()), 'to equal', initial));
    });

    describe('accounts:updateToken', () => {
        it('should update token', () => {
            const newToken = 'newToken';

            expect(accounts({ active: account.id, available: [account] }, updateToken(newToken)), 'to satisfy', {
                active: account.id,
                available: [
                    {
                        ...account,
                        token: newToken,
                    },
                ],
            });
        });
    });
});
