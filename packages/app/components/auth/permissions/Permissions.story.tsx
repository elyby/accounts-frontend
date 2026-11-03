import React, { ComponentType } from 'react';

import { AuthPresenter } from 'app/components/auth/Auth.story';
import reducers from 'app/reducers';
import { Scope } from 'app/services/api/oauth';

import Permissions from './Permissions';

export default { title: 'Components/Auth/Permissions' };

// The reducers return the initial state for an unknown action
const initialState = reducers(undefined, { type: 'storybook/init' } as any);

const PermissionsPresenter: ComponentType<{ scopes: Array<Scope> }> = ({ scopes }) => (
    <AuthPresenter
        factory={Permissions}
        state={{
            auth: { ...initialState.auth, scopes },
            user: { ...initialState.user, id: 1, username: 'ErickSkrauch', isGuest: false },
        }}
    />
);

export const PublicScopes = () => (
    <PermissionsPresenter scopes={['minecraft_server_session', 'offline_access', 'account_info', 'account_email', 'change_skin']} />
);
PublicScopes.storyName = 'Public scopes';

export const OpenIdConnect = () => <PermissionsPresenter scopes={['openid', 'profile', 'email']} />;
OpenIdConnect.storyName = 'OpenID Connect';

export const OnlyOpenId = () => <PermissionsPresenter scopes={['openid']} />;
OnlyOpenId.storyName = 'Only openid (identity confirmation)';

export const UnknownScope = () => <PermissionsPresenter scopes={['unknown_scope']} />;
UnknownScope.storyName = 'Unknown scope';
