import { ADD, REMOVE, ACTIVATE, RESET, UPDATE_TOKEN } from './actions';

/**
 * @typedef {AccountsState}
 * @property {Account} active
 * @property {Account[]} available
 */

/**
 * @param {AccountsState} state
 * @param {string} options.type
 * @param {object} options.payload
 *
 * @return {AccountsState}
 */
export default function accounts(
    state = {
        active: null,
        available: []
    },
    {type, payload = {}}
) {
    switch (type) {
        case ADD:
            if (!payload || !payload.id || !payload.token || !payload.refreshToken) {
                throw new Error('Invalid or empty payload passed for accounts.add');
            }

            state.available = state.available
                .filter((account) => account.id !== payload.id)
                .concat(payload);

            state.available.sort((account1, account2) => {
                if (account1.username === account2.username) {
                    return 0;
                }

                return account1.username > account2.username ? 1 : -1;
            });

            return state;

        case ACTIVATE:
            if (!payload || !payload.id || !payload.token || !payload.refreshToken) {
                throw new Error('Invalid or empty payload passed for accounts.add');
            }

            return {
                ...state,
                active: payload
            };

        case RESET:
            return accounts(undefined, {});

        case REMOVE:
            if (!payload || !payload.id) {
                throw new Error('Invalid or empty payload passed for accounts.remove');
            }

            return {
                ...state,
                available: state.available.filter((account) => account.id !== payload.id)
            };

        case UPDATE_TOKEN:
            if (typeof payload !== 'string') {
                throw new Error('payload must be a jwt token');
            }

            return {
                ...state,
                active: {
                    ...state.active,
                    token: payload
                }
            };

        default:
            return state;
    }
}
