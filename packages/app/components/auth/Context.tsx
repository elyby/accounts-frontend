import React from 'react';
import { User } from 'app/components/user';

import { State as AuthState } from './reducer';

export interface AuthContext {
    auth: AuthState;
    user: User;
    requestRedraw: () => Promise<void>;
    clearErrors: () => void;
    resolve: (payload: Record<string, any> | undefined) => Promise<any> | void;
    reject: (payload: Record<string, any> | undefined) => Promise<any> | void;
}

const Context = React.createContext<AuthContext>({
    auth: {
        error: null,
        login: '',
        scopes: [],
    } as any,
    user: {
        id: null,
        isGuest: true,
    } as any,
    async requestRedraw() {},
    clearErrors() {},
    resolve() {},
    reject() {},
});
Context.displayName = 'AuthContext';

export const { Provider, Consumer } = Context;

export default Context;
