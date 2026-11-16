import React, { ComponentType } from 'react';

import { AuthPresenter } from 'app/components/auth/Auth.story';
import reducers from 'app/reducers';

import { State as AuthState } from '../reducer';

import Password from './Password';

export default { title: 'Components/Auth/Password' };

// The reducers return the initial state for an unknown action
const initialState = reducers(undefined, { type: 'storybook/init' } as any);

const PasswordPresenter: ComponentType<Partial<Pick<AuthState, 'credentials' | 'error'>>> = ({
    credentials = {},
    error = null,
}) => (
    <AuthPresenter
        factory={Password}
        state={{
            auth: {
                ...initialState.auth,
                credentials: { login: 'erickskrauch@ely.by', ...credentials },
                error,
            },
            user: { ...initialState.user, username: 'ErickSkrauch', email: 'erickskrauch@ely.by' },
        }}
    />
);

export const Default = () => <PasswordPresenter />;
Default.storyName = 'Default';

export const DisabledRememberMe = () => <PasswordPresenter credentials={{ isForcedLogin: true }} />;
DisabledRememberMe.storyName = 'Disabled remember me';

export const WithError = () => <PasswordPresenter error={{ password: 'error.password_incorrect' }} />;
WithError.storyName = 'With error';
