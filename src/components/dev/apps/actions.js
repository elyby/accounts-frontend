// @flow

import oauth from 'services/api/oauth';

import type { Dispatch } from 'redux';
import type { Apps } from './reducer';
import type { OauthAppResponse } from 'services/api/oauth';
import type { User } from 'components/user';

export const SET_AVAILABLE = 'SET_AVAILABLE';
export function setAppsList(apps: Array<OauthAppResponse>) {
    return {
        type: SET_AVAILABLE,
        payload: apps,
    };
}

export function getApp(state: {apps: Apps}, clientId: string): ?OauthAppResponse {
    return state.apps.available.find((app) => app.clientId === clientId) || null;
}

export function fetchApp(clientId: string) {
    return async (dispatch: Dispatch<any>, getState: () => {apps: Apps}) => {
        const fetchedApp = await oauth.getApp(clientId);
        const { available } = getState().apps;
        let newApps: Array<OauthAppResponse>;
        if (available.some((app) => app.clientId === fetchedApp.clientId)) {
            newApps = available.map((app) => app.clientId === fetchedApp.clientId ? fetchedApp : app);
        } else {
            newApps = [...available, fetchedApp];
        }

        return dispatch(setAppsList(newApps));
    };
}

export function fetchAvailableApps() {
    return async (dispatch: Dispatch<any>, getState: () => {user: User}) => {
        const { id } = getState().user;
        if (!id) {
            throw new Error('store.user.id is required for this action');
        }

        const apps = await oauth.getAppsByUser(id);

        return dispatch(setAppsList(apps));
    };
}

export function deleteApp(clientId: string) {
    return async (dispatch: Dispatch<any>, getState: () => {apps: Apps}) => {
        await oauth.delete(clientId);
        const apps = getState().apps.available.filter((app) => app.clientId !== clientId);

        return dispatch(setAppsList(apps));
    };
}

export function resetApp(clientId: string, resetSecret: bool) {
    return async (dispatch: Dispatch<any>, getState: () => {apps: Apps}) => {
        const result = await oauth.reset(clientId, resetSecret);
        if (resetSecret) {
            const apps = getState().apps.available.map((app) => app.clientId === clientId ? result.data : app);

            return dispatch(setAppsList(apps));
        }
    };
}
