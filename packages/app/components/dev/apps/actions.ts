import { Dispatch, Action as ReduxAction } from 'redux';
import { OauthAppResponse } from 'app/services/api/oauth';
import oauth from 'app/services/api/oauth';
import { User } from 'app/components/user';
import { ThunkAction } from 'app/reducers';

import { Apps } from './reducer';

interface SetAvailableAction extends ReduxAction {
  type: 'apps:setAvailable';
  payload: Array<OauthAppResponse>;
}

export function setAppsList(apps: Array<OauthAppResponse>): SetAvailableAction {
  return {
    type: 'apps:setAvailable',
    payload: apps,
  };
}

export function getApp(
  state: { apps: Apps },
  clientId: string,
): OauthAppResponse | null {
  return state.apps.available.find((app) => app.clientId === clientId) || null;
}

export function fetchApp(clientId: string): ThunkAction<Promise<void>> {
  return async (dispatch) => {
    const app = await oauth.getApp(clientId);

    dispatch(addApp(app));
  };
}

interface AddAppAction extends ReduxAction {
  type: 'apps:addApp';
  payload: OauthAppResponse;
}

function addApp(app: OauthAppResponse): AddAppAction {
  return {
    type: 'apps:addApp',
    payload: app,
  };
}

export function fetchAvailableApps() {
  return async (
    dispatch: Dispatch<any>,
    getState: () => { user: User },
  ): Promise<void> => {
    const { id } = getState().user;

    if (!id) {
      dispatch(setAppsList([]));

      return;
    }

    const apps = await oauth.getAppsByUser(id);

    dispatch(setAppsList(apps));
  };
}

export function deleteApp(clientId: string) {
  return async (dispatch: Dispatch<any>): Promise<void> => {
    await oauth.delete(clientId);

    dispatch(createDeleteAppAction(clientId));
  };
}

interface DeleteAppAction extends ReduxAction {
  type: 'apps:deleteApp';
  payload: string;
}

function createDeleteAppAction(clientId: string): DeleteAppAction {
  return {
    type: 'apps:deleteApp',
    payload: clientId,
  };
}

export function resetApp(
  clientId: string,
  resetSecret: boolean,
): ThunkAction<Promise<void>> {
  return async (dispatch) => {
    const { data: app } = await oauth.reset(clientId, resetSecret);

    if (resetSecret) {
      dispatch(addApp(app));
    }
  };
}

export type Action = SetAvailableAction | DeleteAppAction | AddAppAction;
