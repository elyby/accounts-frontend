import React from 'react';
import expect from 'app/test/unexpected';
import sinon from 'sinon';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import feedback from 'app/services/api/feedback';
import { User } from 'app/components/user';
import { TestContextProvider } from 'app/shell';

import { ContactForm } from './ContactForm';

beforeEach(() => {
    sinon.stub(feedback, 'send').returns(Promise.resolve() as any);
});

afterEach(() => {
    (feedback.send as any).restore();
});

describe('ContactForm', () => {
    it('should contain Form', () => {
        const user = {} as User;

        render(
            <TestContextProvider>
                <ContactForm user={user} />
            </TestContextProvider>,
        );

        expect(screen.getAllByRole('textbox').length, 'to be greater than', 1);

        expect(screen.getByRole('button', { name: /Send/ }), 'to have property', 'type', 'submit');

        [
            {
                label: 'subject',
                name: 'subject',
            },
            {
                label: 'E‑mail',
                name: 'email',
            },
            {
                label: 'message',
                name: 'message',
            },
        ].forEach((el) => {
            expect(screen.getByLabelText(el.label, { exact: false }), 'to have property', 'name', el.name);
        });
    });

    describe('when rendered with user', () => {
        const user = {
            email: 'foo@bar.com',
        } as User;

        it('should render email field with user email', () => {
            render(
                <TestContextProvider>
                    <ContactForm user={user} />
                </TestContextProvider>,
            );

            expect(screen.getByDisplayValue(user.email), 'to be a', HTMLInputElement);
        });
    });

    it('should submit and then hide form and display success message', async () => {
        const user = {
            email: 'foo@bar.com',
        } as User;

        render(
            <TestContextProvider>
                <ContactForm user={user} />
            </TestContextProvider>,
        );

        fireEvent.change(screen.getByLabelText(/subject/i), {
            target: {
                value: 'subject',
            },
        });

        fireEvent.change(screen.getByLabelText(/message/i), {
            target: {
                value: 'the message',
            },
        });

        const button = screen.getByRole('button', { name: 'Send' });

        expect(button, 'to have property', 'disabled', false);

        fireEvent.click(button);

        expect(button, 'to have property', 'disabled', true);
        expect(feedback.send, 'to have a call exhaustively satisfying', [
            {
                subject: 'subject',
                email: user.email,
                category: '',
                message: 'the message',
            },
        ]);

        await waitFor(() => {
            expect(screen.getByText('Your message was received', { exact: false }), 'to be a', HTMLElement);
        });

        expect(screen.getByText(user.email), 'to be a', HTMLElement);

        expect(screen.queryByRole('button', { name: /Send/ }), 'to be null');
    });

    it('should show validation messages', async () => {
        const user = {
            email: 'foo@bar.com',
        } as User;

        (feedback.send as any).callsFake(() =>
            Promise.reject({
                success: false,
                errors: { email: 'error.email_invalid' },
            }),
        );

        render(
            <TestContextProvider>
                <ContactForm user={user} />
            </TestContextProvider>,
        );

        fireEvent.change(screen.getByLabelText(/subject/i), {
            target: {
                value: 'subject',
            },
        });

        fireEvent.change(screen.getByLabelText(/message/i), {
            target: {
                value: 'the message',
            },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Send' }));

        await waitFor(() => {
            expect(screen.getByRole('alert'), 'to have property', 'innerHTML', 'E‑mail is invalid');
        });
    });
});
