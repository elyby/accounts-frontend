import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import expect from 'app/test/unexpected';
import sinon from 'sinon';

import type { CaptchaComponentHandle, CaptchaComponentProps } from 'app/services/captcha/types';

import createSdkCaptcha, { SdkRenderOptions, SdkWidget } from './createSdkCaptcha';

describe('createSdkCaptcha', () => {
    const params = { publicKey: 'public-key' };

    let widget: { render: sinon.SinonStub; reset: sinon.SinonSpy; destroy: sinon.SinonSpy };
    let props: Omit<CaptchaComponentProps, 'skin' | 'lang'> & {
        onSetCode: sinon.SinonSpy;
        onExpire: sinon.SinonSpy;
        onError: sinon.SinonSpy;
    };

    beforeEach(() => {
        let nextId = 0;
        widget = {
            render: sinon.stub().callsFake(() => ++nextId),
            reset: sinon.spy(),
            destroy: sinon.spy(),
        };
        props = {
            params,
            color: 'green',
            onSetCode: sinon.spy(),
            onExpire: sinon.spy(),
            onError: sinon.spy(),
        };
    });

    const renderWidget = (skin: 'dark' | 'light' = 'dark', lang = 'en') => {
        const Component = createSdkCaptcha('FakeCaptcha', widget as SdkWidget);
        const ref = createRef<CaptchaComponentHandle>();
        const element = (newSkin: typeof skin, newLang: string) => (
            <Component ref={ref} {...props} skin={newSkin} lang={newLang} />
        );
        const result = render(element(skin, lang));

        return {
            ref,
            rerender: (newSkin: typeof skin, newLang: string) => result.rerender(element(newSkin, newLang)),
            unmount: result.unmount,
        };
    };

    const lastRenderOptions = (): SdkRenderOptions => widget.render.lastCall.args[2];

    it('should render the widget into its own element with the passed options', () => {
        renderWidget('dark', 'ru');

        expect(widget.render, 'was called once');
        const [el, passedParams, options] = widget.render.lastCall.args;

        expect(el, 'to be an', HTMLElement);
        expect(el.isConnected, 'to be true');
        expect(passedParams, 'to equal', params);
        expect(options, 'to satisfy', { skin: 'dark', lang: 'ru' });
    });

    it('should pass the token and its expiration', () => {
        renderWidget();

        lastRenderOptions().onSetCode('token');
        expect(props.onSetCode, 'to have a call satisfying', ['token']);

        lastRenderOptions().onExpire();
        expect(props.onExpire, 'was called once');
    });

    it('should reset the rendered widget', () => {
        const { ref } = renderWidget();

        ref.current!.reset();

        expect(widget.reset, 'to have a call satisfying', [1]);
    });

    it('should re-render the widget on the skin or locale change and forget the old token', () => {
        const { rerender } = renderWidget('dark', 'en');
        const [firstEl] = widget.render.firstCall.args;

        rerender('light', 'en');

        expect(widget.destroy, 'to have a call satisfying', [1]);
        expect(firstEl.isConnected, 'to be false');
        expect(props.onExpire, 'was called once');
        expect(widget.render, 'was called twice');
        expect(lastRenderOptions(), 'to satisfy', { skin: 'light' });

        rerender('light', 'ru');

        expect(widget.render, 'was called thrice');
        expect(lastRenderOptions(), 'to satisfy', { lang: 'ru' });
    });

    it('should not re-render the widget when only the callbacks are changed', () => {
        const { rerender } = renderWidget();
        const onSetCode = sinon.spy();
        props.onSetCode = onSetCode;

        rerender('dark', 'en');

        expect(widget.render, 'was called once');

        lastRenderOptions().onSetCode('token');
        expect(onSetCode, 'to have a call satisfying', ['token']);
    });

    it('should destroy the widget on unmount', () => {
        const { unmount } = renderWidget();

        unmount();

        expect(widget.destroy, 'to have a call satisfying', [1]);
    });

    it('should report the rendering error', () => {
        const error = new Error('SDK failure');
        widget.render.throws(error);

        const { ref } = renderWidget();

        expect(props.onError, 'to have a call satisfying', [error]);

        // There is no widget to reset
        ref.current!.reset();
        expect(widget.reset, 'was not called');
    });
});
