// @flow
export type Account = {
  id: number,
  username: string,
  email: string,
  token: string,
  refreshToken: ?string,
};

export type State = {
  active: ?number,
  available: Array<Account>,
};

export type AddAction = { type: 'accounts:add', payload: Account };
export type RemoveAction = { type: 'accounts:remove', payload: Account };
export type ActivateAction = { type: 'accounts:activate', payload: Account };
export type UpdateTokenAction = {
  type: 'accounts:updateToken',
  payload: string,
};
export type ResetAction = { type: 'accounts:reset' };

type Action =
  | AddAction
  | RemoveAction
  | ActivateAction
  | UpdateTokenAction
  | ResetAction;

export function getActiveAccount(state: { accounts: State }): ?Account {
  const accountId = state.accounts.active;

  return state.accounts.available.find(account => account.id === accountId);
}

export function getAvailableAccounts(state: {
  accounts: State,
}): Array<Account> {
  return state.accounts.available;
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

      state.available = state.available
        .filter(account => account.id !== payload.id)
        .concat(payload);

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
        available: state.available.map(account => {
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
        available: state.available.filter(account => account.id !== payload.id),
      };
    }

    case 'accounts:updateToken': {
      if (typeof action.payload !== 'string') {
        throw new Error('payload must be a jwt token');
      }

      const { payload } = action;

      return {
        ...state,
        available: state.available.map(account => {
          if (account.id === state.active) {
            return {
              ...account,
              token: payload,
            };
          }

          return { ...account };
        }),
      };
    }

    default:
      (action: empty);

      return state;
  }
}
