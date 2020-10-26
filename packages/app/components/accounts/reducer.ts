import { Action } from './actions/pure-actions';

export type Account = {
    id: number;
    username: string;
    email: string;
    token: string;
    refreshToken: string | null;
    isDeleted: boolean;
};

export type State = {
    active: number | null;
    available: Array<Account>;
};

export function getActiveAccount(state: { accounts: State }): Account | null {
    const accountId = state.accounts.active;

    return state.accounts.available.find((account) => account.id === accountId) || null;
}

export function getAvailableAccounts(state: { accounts: State }): Array<Account> {
    return state.accounts.available;
}

/**
 * Move deleted accounts to the end of the accounts list.
 */
export function getSortedAccounts(state: { accounts: State }): ReadonlyArray<Account> {
    return state.accounts.available.sort((acc1, acc2) => {
        if (acc1.isDeleted && !acc2.isDeleted) {
            return 1;
        }

        if (!acc1.isDeleted && acc2.isDeleted) {
            return -1;
        }

        return 0;
    });
}

export default function accounts(
    state: State = {
        active: null,
        available: [],
    },
    action: Action,
): State {
    switch (action.type) {
        case 'accounts:add': {
            if (!action.payload || !action.payload.id || !action.payload.token) {
                throw new Error('Invalid or empty payload passed for accounts.add');
            }

            const { payload } = action;

            state.available = state.available.filter((account) => account.id !== payload.id).concat(payload);

            state.available.sort((account1, account2) => {
                if (account1.username === account2.username) {
                    return 0;
                }

                return account1.username > account2.username ? 1 : -1;
            });

            return state;
        }

        case 'accounts:activate': {
            if (!action.payload || !action.payload.id || !action.payload.token) {
                throw new Error('Invalid or empty payload passed for accounts.add');
            }

            const { payload } = action;

            return {
                available: state.available.map((account) => {
                    if (account.id === payload.id) {
                        return { ...payload };
                    }

                    return { ...account };
                }),
                active: payload.id,
            };
        }

        case 'accounts:reset':
            return {
                active: null,
                available: [],
            };

        case 'accounts:remove': {
            if (!action.payload || !action.payload.id) {
                throw new Error('Invalid or empty payload passed for accounts.remove');
            }

            const { payload } = action;

            return {
                ...state,
                available: state.available.filter((account) => account.id !== payload.id),
            };
        }

        case 'accounts:updateToken': {
            return partiallyUpdateActiveAccount(state, {
                token: action.payload,
            });
        }

        case 'accounts:markAsDeleted': {
            return partiallyUpdateActiveAccount(state, {
                isDeleted: action.payload,
            });
        }
    }

    return state;
}

function partiallyUpdateActiveAccount(state: State, payload: Partial<Account>): State {
    return {
        ...state,
        available: state.available.map((account) => {
            if (account.id === state.active) {
                return {
                    ...account,
                    ...payload,
                };
            }

            return { ...account };
        }),
    };
}
