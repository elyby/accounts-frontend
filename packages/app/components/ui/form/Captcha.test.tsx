import React, { createRef, forwardRef, useImperativeHandle } from 'react';
import { act, render, screen } from '@testing-library/react';
import expect from 'app/test/unexpected';
import sinon from 'sinon';
import { TestContextProvider } from 'app/shell';
import * as captcha from 'app/services/captcha';
import type { CaptchaComponentHandle, CaptchaComponentProps, CaptchaProvider } from 'app/services/captcha';

import Captcha, { CaptchaHandle } from './Captcha';

describe('Captcha', () => {
    let lastProps: CaptchaComponentProps | undefined;
    let componentReset: sinon.SinonSpy;

    const FakeWidget = forwardRef<CaptchaComponentHandle, CaptchaComponentProps>((props, ref) => {
        lastProps = props;
        useImperativeHandle(ref, () => ({ reset: componentReset }));

        return <div data-testid="widget" data-skin={props.skin} data-color={props.color} />;
    });

    const componentProvider: CaptchaProvider = {
        type: 'altcha',
        load: () => Promise.resolve(),
        Component: FakeWidget,
    };

    const renderCaptcha = (props: React.ComponentProps<typeof Captcha> = {}) => {
        const ref = createRef<CaptchaHandle>();
        const result = render(
            <TestContextProvider>
                <Captcha ref={ref} {...props} />
            </TestContextProvider>,
        );

        return {
            ref,
            rerender: (newProps: React.ComponentProps<typeof Captcha>) =>
                result.rerender(
                    <TestContextProvider>
                        <Captcha ref={ref} {...newProps} />
                    </TestContextProvider>,
                ),
        };
    };

    beforeEach(() => {
        lastProps = undefined;
        componentReset = sinon.spy();
        sinon.stub(captcha, 'resolveCaptcha').resolves({
            provider: componentProvider,
            params: { challengeUrl: '/challenge' },
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should render the component provider inside the form', async () => {
        renderCaptcha({ skin: 'dark', color: 'blue' });

        const widget = await screen.findByTestId('widget');

        expect(widget.getAttribute('data-skin'), 'to equal', 'dark');
        expect(widget.getAttribute('data-color'), 'to equal', 'blue');
        expect(lastProps!.params, 'to equal', { challengeUrl: '/challenge' });
    });

    describe('delay', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should resolve the provider at once and render the lightweight widget without the delay', async () => {
            renderCaptcha({ delay: 600 });

            expect(captcha.resolveCaptcha, 'was called once');
            await act(async () => {});

            expect(screen.queryByTestId('widget'), 'not to be null');
        });

        it('should postpone the rendering of the deferred widget until the delay passes', async () => {
            (captcha.resolveCaptcha as sinon.SinonStub).resolves({
                provider: { ...componentProvider, isRenderingDeferred: true },
                params: { publicKey: 'key' },
            });

            renderCaptcha({ delay: 600 });

            // The provider is resolved during the delay
            expect(captcha.resolveCaptcha, 'was called once');
            await act(async () => {});
            expect(screen.queryByTestId('widget'), 'to be null');

            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(screen.queryByTestId('widget'), 'not to be null');
        });
    });

    it('should return the token, passed by the widget', async () => {
        const { ref } = renderCaptcha();
        await screen.findByTestId('widget');

        expect(ref.current!.getValue(), 'to be undefined');

        act(() => lastProps!.onSetCode('token'));

        expect(ref.current!.getValue(), 'to equal', { type: 'altcha', token: 'token' });

        act(() => lastProps!.onExpire());

        expect(ref.current!.getValue(), 'to be undefined');
    });

    it('should keep the token on the skin change', async () => {
        const { ref, rerender } = renderCaptcha({ skin: 'dark' });
        await screen.findByTestId('widget');
        act(() => lastProps!.onSetCode('token'));

        rerender({ skin: 'light' });

        expect(screen.getByTestId('widget').getAttribute('data-skin'), 'to equal', 'light');
        expect(ref.current!.getValue(), 'to equal', { type: 'altcha', token: 'token' });
    });

    it('should reset the widget when the form is invalid', async () => {
        const { ref } = renderCaptcha();
        await screen.findByTestId('widget');
        act(() => lastProps!.onSetCode('token'));

        act(() => ref.current!.onFormInvalid());

        expect(ref.current!.getValue(), 'to be undefined');
        expect(componentReset, 'was called once');
    });

    it('should pass the locale to the widget', async () => {
        renderCaptcha();
        await screen.findByTestId('widget');

        expect(lastProps!.lang, 'to equal', 'en');
    });

    it('should show the error, when the widget cannot be rendered', async () => {
        renderCaptcha();
        await screen.findByTestId('widget');

        act(() => lastProps!.onError(new Error('SDK failure')));

        expect(screen.queryByTestId('widget'), 'to be null');
        expect(screen.getByRole('alert').textContent, 'to contain', 'Failed to load the captcha');
    });
});
