import React from 'react';
import sinon from 'sinon';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

import expect from 'app/test/unexpected';
import * as feedback from 'app/services/api/feedback';
import { TestContextProvider } from 'app/shell';

import ContactFormPopup from './ContactFormPopup';

beforeEach(() => {
    sinon.stub(feedback, 'send').returns(Promise.resolve() as any);
});

afterEach(() => {
    (feedback.send as any).restore();
});

describe('ContactFormPopup', () => {
    const email = 'foo@bar.com';

    it('should contain Form', () => {
        render(
            <TestContextProvider>
                <ContactFormPopup />
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

    describe('when email provided', () => {
        it('should render email field with user email', () => {
            render(
                <TestContextProvider>
                    <ContactFormPopup initEmail={email} />
                </TestContextProvider>,
            );

            expect(screen.getByDisplayValue(email), 'to be a', HTMLInputElement);
        });
    });

    it('should call the onSubmit callback when submitted', async () => {
        let onSubmitResolvePromise: Function;
        const onSubmitMock = jest.fn(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (form): Promise<void> =>
                new Promise((resolve) => {
                    onSubmitResolvePromise = resolve;
                }),
        );

        render(
            <TestContextProvider>
                <ContactFormPopup initEmail={email} onSubmit={onSubmitMock} />
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
        expect(onSubmitMock.mock.calls.length, 'to be', 1);
        expect(onSubmitMock.mock.calls[0][0], 'to equal', {
            subject: 'subject',
            email,
            category: '',
            message: 'the message',
        });

        // @ts-ignore
        onSubmitResolvePromise();

        await waitFor(() => {
            expect(button, 'to have property', 'disabled', false);
        });
    });

    it('should display error messages', async () => {
        const onSubmitMock = jest.fn(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (form): Promise<void> =>
                Promise.reject({
                    success: false,
                    errors: { email: 'error.email_invalid' },
                }),
        );

        render(
            <TestContextProvider>
                <ContactFormPopup initEmail="invalid@email" onSubmit={onSubmitMock} />
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
