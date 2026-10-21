import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import type { CaptchaComponent, CaptchaComponentHandle, CaptchaComponentProps, CaptchaPublicParams } from 'app/services/captcha/types';
import type { Skin } from 'app/components/ui';
import logger from 'app/services/logger';

export type SdkWidgetId = string | number;

export interface SdkRenderOptions {
    skin: Skin;
    lang: string;
    onSetCode(token: string): void;
    onExpire(): void;
}

/**
 * The imperative API of a third-party widget, rendered by the provider's SDK into a DOM element
 */
export interface SdkWidget {
    render(el: HTMLElement, params: CaptchaPublicParams, options: SdkRenderOptions): SdkWidgetId;
    reset(id: SdkWidgetId): void;
    destroy(id: SdkWidgetId): void;
}

/**
 * Wraps the imperative SDK's API into the captcha component, so all providers are rendered the same way
 */
export default function createSdkCaptcha(displayName: string, widget: SdkWidget): CaptchaComponent {
    const SdkCaptcha = forwardRef<CaptchaComponentHandle, CaptchaComponentProps>(
        ({ params, skin, lang, onSetCode, onExpire, onError }, ref) => {
            const containerRef = useRef<HTMLDivElement>(null);
            const idRef = useRef<SdkWidgetId>();

            // The callbacks are read through the refs, so their identity changes don't re-render the widget
            const callbacksRef = useRef({ onSetCode, onExpire, onError });
            callbacksRef.current = { onSetCode, onExpire, onError };

            useImperativeHandle(ref, () => ({
                reset() {
                    if (idRef.current !== undefined) {
                        widget.reset(idRef.current);
                    }
                },
            }), []);

            // SDK widgets can't be reconfigured, so they're re-rendered after the skin or locale change
            useEffect(() => {
                // Render each widget into its own element, which is out of React's control,
                // so it can be safely re-rendered
                const host = document.createElement('div');
                containerRef.current!.appendChild(host);

                try {
                    idRef.current = widget.render(host, params, {
                        skin,
                        lang,
                        onSetCode: (token) => callbacksRef.current.onSetCode(token),
                        onExpire: () => callbacksRef.current.onExpire(),
                    });
                } catch (error) {
                    callbacksRef.current.onError(error);
                }

                return () => {
                    const id = idRef.current;
                    idRef.current = undefined;

                    if (id !== undefined) {
                        try {
                            widget.destroy(id);
                        } catch (error) {
                            logger.warn('Failed to destroy captcha widget', { error });
                        }
                    }

                    host.remove();
                    // The destroyed widget can't be reset anymore, so its token is forgotten. The user passes the new one
                    callbacksRef.current.onExpire();
                };
            }, [params, skin, lang]);

            return <div ref={containerRef} />;
        },
    );

    SdkCaptcha.displayName = displayName;

    return SdkCaptcha;
}
