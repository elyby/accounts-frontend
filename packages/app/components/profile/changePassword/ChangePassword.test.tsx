import React from 'react';
import uxpect from 'app/test/unexpected';
import { render, fireEvent, screen } from '@testing-library/react';
import sinon from 'sinon';
import { TestContextProvider } from 'app/shell';

import ChangePassword from './ChangePassword';

describe('<ChangePassword />', () => {
    it('renders two <Input /> components', () => {
        render(
            <TestContextProvider>
                <ChangePassword onSubmit={async () => {}} />
            </TestContextProvider>,
        );

        expect(screen.getByLabelText('New password', { exact: false })).toBeInTheDocument();
        expect(screen.getByLabelText('Repeat the password', { exact: false })).toBeInTheDocument();
    });

    it('should call onSubmit if passwords entered', async () => {
        const onSubmit = sinon.spy(() => Promise.resolve()).named('onSubmit');

        render(
            <TestContextProvider>
                <ChangePassword onSubmit={onSubmit} />
            </TestContextProvider>,
        );

        fireEvent.change(screen.getByLabelText('New password', { exact: false }), {
            target: {
                value: '123',
            },
        });

        fireEvent.change(screen.getByLabelText('Repeat the password', { exact: false }), {
            target: {
                value: '123',
            },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Change password' }).closest('button') as HTMLButtonElement);

        uxpect(onSubmit, 'was called');
    });
});
