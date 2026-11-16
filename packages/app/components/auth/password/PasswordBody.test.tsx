import React from 'react';
import expect from 'app/test/unexpected';
import { render, screen } from '@testing-library/react';
import { TestContextProvider } from 'app/shell';

import Context, { AuthContext } from '../Context';
import { Credentials } from '../reducer';

import PasswordBody from './PasswordBody';

function renderBody(credentials: Credentials) {
    const context = {
        auth: { error: null, credentials },
        user: { email: 'foo@ely.by' },
        clearErrors() {},
        resolve() {},
        reject() {},
    } as unknown as AuthContext;

    render(
        <TestContextProvider>
            <Context.Provider value={context}>
                <PasswordBody {...({} as any)} />
            </Context.Provider>
        </TestContextProvider>,
    );
}

describe('PasswordBody', () => {
    it('should offer to remember the account', () => {
        renderBody({ login: 'foo@ely.by' });

        expect(screen.queryByRole('checkbox'), 'not to be null');
    });

    it('should not offer to remember the account during the forced login', () => {
        renderBody({ login: 'foo@ely.by', isForcedLogin: true });

        expect(screen.queryByRole('checkbox'), 'to be null');
    });
});
