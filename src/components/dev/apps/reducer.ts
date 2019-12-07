import { OauthAppResponse } from 'services/api/oauth';

import { Action } from './actions';

export interface Apps {
  available: OauthAppResponse[];
}

const defaults: Apps = {
  available: [],
};

export default function apps(state: Apps = defaults, action: Action): Apps {
  switch (action.type) {
    case 'apps:setAvailable':
      return {
        ...state,
        available: action.payload,
      };

    case 'apps:addApp': {
      const { payload } = action;
      const available = [...state.available];
      let index = available.findIndex(app => app.clientId === payload.clientId);

      if (index === -1) {
        index = available.length;
      }

      available[index] = action.payload;

      return {
        ...state,
        available,
      };
    }

    case 'apps:deleteApp':
      return {
        ...state,
        available: state.available.filter(
          app => app.clientId !== action.payload,
        ),
      };

    default:
  }

  return state;
}
