import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';
import clsx from 'clsx';

import { Skin, SKIN_LIGHT } from 'app/components/ui';
import { ComponentLoader } from 'app/components/ui/loader';
import { useReduxSelector } from 'app/functions';
import { CaptchaProvider, CaptchaValue, CaptchaWidgetId, registerE2eCallback, resolveCaptcha } from 'app/services/captcha';
import logger from 'app/services/logger';

import formStyles from './form.scss';
import styles from './captcha.scss';
import FormError from './FormError';
import { FormFieldHandle, ValidationError } from './FormModel';

type Error = ValidationError | MessageDescriptor;

interface Props {
    skin?: Skin;
    /**
     * Postpones widget rendering, e.g. to let the panel's appearance animation finish
     */
    delay?: number;
    error?: Error;
    /**
     * Applied to the widget's frame, e.g. to limit its width in a particular layout
     */
    className?: string;
}

export interface CaptchaHandle extends FormFieldHandle {
    getValue(): CaptchaValue | undefined;
    reset(): void;
}

interface Widget {
    provider: CaptchaProvider;
    id: CaptchaWidgetId;
}

type Status = 'loading' | 'ready' | 'unavailable';

const Captcha = forwardRef<CaptchaHandle, Props>(({ skin = SKIN_LIGHT, delay = 0, error: propsError, className }, ref) => {
    const locale = useReduxSelector((state) => state.i18n.locale);

    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<Widget>();
    // The token isn't stored in the state, since it doesn't affect rendering
    const valueRef = useRef<CaptchaValue>();

    const [status, setStatus] = useState<Status>('loading');
    const [providerType, setProviderType] = useState<string>();
    const [error, setError] = useState<Error | null>(null);

    const reset = useCallback(() => {
        // Tokens are single-use, so the old one must not be submitted again
        valueRef.current = undefined;

        const widget = widgetRef.current;

        if (widget) {
            widget.provider.reset(widget.id);
        }
    }, []);

    useImperativeHandle(ref, () => ({
        getValue: () => valueRef.current,
        setError,
        reset,
        onFormInvalid: reset,
        focus() {},
    }), [reset]);

    useEffect(() => {
        return registerE2eCallback((value) => {
            valueRef.current = value;
        });
    }, []);

    useEffect(() => {
        let isCancelled = false;
        setStatus('loading');
        // Render each widget into its own element, so it can be safely re-rendered after locale or skin change
        const host = document.createElement('div');

        const timer = setTimeout(async () => {
            try {
                const { provider, params } = await resolveCaptcha(locale);

                if (isCancelled || !containerRef.current) {
                    return;
                }

                containerRef.current.appendChild(host);

                const id = provider.render(host, params, {
                    skin,
                    lang: locale,
                    onSetCode(token) {
                        valueRef.current = {
                            type: provider.type,
                            token,
                        };
                    },
                    onExpire() {
                        valueRef.current = undefined;
                    },
                });

                widgetRef.current = { provider, id };
                setProviderType(provider.type);
                setStatus('ready');
            } catch (err) {
                if (isCancelled) {
                    return;
                }

                logger.error('Failed rendering captcha', { error: err });
                setStatus('unavailable');
            }
        }, delay);

        return () => {
            isCancelled = true;
            clearTimeout(timer);

            const widget = widgetRef.current;
            widgetRef.current = undefined;
            valueRef.current = undefined;

            if (widget) {
                try {
                    widget.provider.destroy(widget.id);
                } catch (err) {
                    logger.warn('Failed to destroy captcha widget', { error: err });
                }
            }

            host.remove();
        };
    }, [locale, skin]);

    return (
        <div className={styles.captchaContainer}>
            {status === 'loading' && (
                <div className={styles.captchaLoader}>
                    <ComponentLoader />
                </div>
            )}

            {status === 'unavailable' ? (
                <div className={formStyles.fieldError} role="alert">
                    <Message
                        key="captchaUnavailable"
                        defaultMessage="Failed to load the captcha. Please, reload the page or try later."
                    />
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className={clsx(
                        styles.captcha,
                        styles[`${skin}Captcha`],
                        {
                            [styles[`${providerType}Captcha`]]: providerType,
                        },
                        className,
                    )}
                />
            )}

            <FormError error={error || propsError} />
        </div>
    );
});

Captcha.displayName = 'Captcha';

export default Captcha;
