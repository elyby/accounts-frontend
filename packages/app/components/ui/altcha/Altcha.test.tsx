import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import expect from 'app/test/unexpected';
import sinon from 'sinon';
import type { CaptchaComponentHandle } from 'app/services/captcha/types';
import type { ProgressListener, VerifyResult } from 'app/services/captcha/providers/altcha/verify';
import logger from 'app/services/logger';

import Altcha, { EXPIRATION_MARGIN } from './Altcha';

interface Deferred {
    resolve(result: VerifyResult): void;
    reject(error: Error): void;
    signal: AbortSignal;
    onProgress?: ProgressListener;
}

describe('Altcha', () => {
    let calls: Array<Deferred>;
    let onSetCode: sinon.SinonSpy;
    let onExpire: sinon.SinonSpy;

    const verify = (challengeUrl: string, signal: AbortSignal, onProgress?: ProgressListener) =>
        new Promise<VerifyResult>((resolve, reject) => {
            calls.push({ resolve, reject, signal, onProgress });
        });

    const renderCaptcha = () => {
        const ref = createRef<CaptchaComponentHandle>();

        const { unmount } = render(
            <IntlProvider locale="en" defaultLocale="en">
                <Altcha
                    ref={ref}
                    params={{ challengeUrl: '/challenge' }}
                    skin="dark"
                    color="green"
                    lang="en"
                    verify={verify}
                    onSetCode={onSetCode}
                    onExpire={onExpire}
                    onError={sinon.spy()}
                />
            </IntlProvider>,
        );

        return { ref, unmount };
    };

    const getState = () => screen.getByTestId('altcha').getAttribute('data-state');
    const clickCheckbox = () => fireEvent.click(screen.getByRole('checkbox'));

    beforeEach(() => {
        calls = [];
        onSetCode = sinon.spy();
        onExpire = sinon.spy();
        sinon.stub(logger, 'warn');
        // jsdom has no canvas support and complains about it, the widget works without the canvas as well
        sinon.stub(HTMLCanvasElement.prototype, 'getContext').returns(null);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should start a single verification on the label click', () => {
        renderCaptcha();

        // The label fills the whole widget, and its click is followed by the click on the input
        fireEvent.click(screen.getByText('I’m not a creeper'));

        expect(getState(), 'to equal', 'verifying');
        expect(calls.length, 'to equal', 1);
    });

    it('should verify on click and pass the token', async () => {
        renderCaptcha();

        expect(getState(), 'to equal', 'idle');
        expect(screen.getByRole('checkbox'), 'to have property', 'checked', false);

        clickCheckbox();

        expect(getState(), 'to equal', 'verifying');
        expect(screen.getByRole('checkbox'), 'to have property', 'disabled', true);

        await act(async () => calls[0].resolve({ token: 'token', expiresAt: Date.now() + 3_600_000 }));

        expect(getState(), 'to equal', 'verified');
        expect(screen.getByRole('checkbox'), 'to have property', 'checked', true);
        expect(onSetCode, 'to have a call satisfying', ['token']);
    });

    it('should show the world generation map and report the progress to it while verifying', async () => {
        renderCaptcha();
        expect(document.querySelector('canvas'), 'to be null');

        clickCheckbox();

        expect(document.querySelector('canvas'), 'not to be null');
        expect(calls[0].onProgress, 'to be a function');
        act(() => calls[0].onProgress!(0.5));

        // The label waits for the end of the generation, but the state is changed at once
        await act(async () => calls[0].resolve({ token: 'token', expiresAt: Date.now() + 3_600_000 }));

        expect(getState(), 'to equal', 'verified');
        expect(screen.getByText('Generating…'), 'to be ok');
    });

    it('should not start a new verification when already verified', async () => {
        renderCaptcha();
        clickCheckbox();
        await act(async () => calls[0].resolve({ token: 'token', expiresAt: Date.now() + 3_600_000 }));

        clickCheckbox();

        expect(calls, 'to have length', 1);
        expect(getState(), 'to equal', 'verified');
    });

    it('should show the error and allow to retry', async () => {
        renderCaptcha();
        clickCheckbox();

        await act(async () => calls[0].reject(new Error('Network error')));

        expect(getState(), 'to equal', 'error');
        expect(onSetCode, 'was not called');

        clickCheckbox();
        await act(async () => calls[1].resolve({ token: 'token', expiresAt: Date.now() + 3_600_000 }));

        expect(getState(), 'to equal', 'verified');
    });

    it('should abort the verification on reset', async () => {
        const { ref } = renderCaptcha();
        clickCheckbox();

        act(() => ref.current!.reset());

        expect(calls[0].signal.aborted, 'to be true');
        expect(getState(), 'to equal', 'idle');

        // The late result of the aborted verification is ignored
        await act(async () => calls[0].resolve({ token: 'stale', expiresAt: Date.now() + 3_600_000 }));

        expect(onSetCode, 'was not called');
        expect(getState(), 'to equal', 'idle');
    });

    it('should return to the initial state on reset after the verification', async () => {
        const { ref } = renderCaptcha();
        clickCheckbox();
        await act(async () => calls[0].resolve({ token: 'token', expiresAt: Date.now() + 3_600_000 }));

        act(() => ref.current!.reset());

        expect(getState(), 'to equal', 'idle');
        expect(screen.getByRole('checkbox'), 'to have property', 'checked', false);
    });

    it('should abort the verification on unmount', () => {
        const { unmount } = renderCaptcha();
        clickCheckbox();

        unmount();

        expect(calls[0].signal.aborted, 'to be true');
    });

    describe('expiration', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should not expire immediately when the lifetime exceeds the timer limit', async () => {
            renderCaptcha();
            clickCheckbox();
            await act(async () => calls[0].resolve({ token: 'token', expiresAt: Date.now() + 365 * 86_400_000 }));

            act(() => {
                jest.advanceTimersByTime(60_000);
            });

            expect(onExpire, 'was not called');
            expect(getState(), 'to equal', 'verified');
        });

        it('should expire the token before the backend rejects it', async () => {
            renderCaptcha();
            clickCheckbox();
            await act(async () => calls[0].resolve({ token: 'token', expiresAt: Date.now() + 60_000 }));

            act(() => {
                jest.advanceTimersByTime(60_000 - EXPIRATION_MARGIN - 1);
            });
            expect(onExpire, 'was not called');

            act(() => {
                jest.advanceTimersByTime(1);
            });

            await waitFor(() => expect(getState(), 'to equal', 'idle'));
            expect(onExpire, 'was called once');
        });
    });
});
