import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FormattedMessage as Message, MessageDescriptor } from 'react-intl';
import clsx from 'clsx';

import { Color, COLOR_GREEN, Skin, SKIN_LIGHT } from 'app/components/ui';
import { ComponentLoader } from 'app/components/ui/loader';
import { useReduxSelector } from 'app/functions';
import {
    type CaptchaComponentHandle,
    type CaptchaValue,
    type ResolvedCaptcha,
    registerE2eCallback,
    resolveCaptcha,
} from 'app/services/captcha';
import logger from 'app/services/logger';

import formStyles from './form.scss';
import styles from './captcha.scss';
import FormError from './FormError';
import type { FormFieldHandle, ValidationError } from './FormModel';

type Error = ValidationError | MessageDescriptor;

interface Props {
    skin?: Skin;
    /**
     * Color accent if the resolved captcha supports it
     */
    color?: Color;
    /**
     * Postpones rendering of the heavy third-party widgets (see CaptchaProvider.isRenderingDeferred).
     * The provider is resolved at once anyway.
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

const Captcha = forwardRef<CaptchaHandle, Props>(({ skin = SKIN_LIGHT, color = COLOR_GREEN, delay = 0, error: propsError, className }, ref) => {
    const locale = useReduxSelector((state) => state.i18n.locale);

    const widgetRef = useRef<CaptchaComponentHandle>(null);
    // The token isn't stored in the state, since it doesn't affect rendering
    const valueRef = useRef<CaptchaValue>();

    const [resolved, setResolved] = useState<ResolvedCaptcha>();
    const [isUnavailable, setIsUnavailable] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const reset = useCallback(() => {
        // Tokens are single-use, so the old one must not be submitted again
        valueRef.current = undefined;
        widgetRef.current?.reset();
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

    // The provider is chosen once: its choice is memoized for the whole page lifetime anyway
    useEffect(() => {
        let isCancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const mountedAt = Date.now();

        resolveCaptcha(locale).then(
            (result) => {
                if (isCancelled) {
                    return;
                }

                const remainingDelay = result.provider.isRenderingDeferred ? delay - (Date.now() - mountedAt) : 0;

                if (remainingDelay > 0) {
                    timer = setTimeout(() => setResolved(result), remainingDelay);
                } else {
                    setResolved(result);
                }
            },
            (err) => {
                if (isCancelled) {
                    return;
                }

                logger.error('Failed rendering captcha', { error: err });
                setIsUnavailable(true);
            },
        );

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const providerType = resolved?.provider.type;

    const callbacks = useMemo(() => ({
        onSetCode(token: string) {
            if (providerType) {
                valueRef.current = { type: providerType, token };
            }
        },
        onExpire() {
            valueRef.current = undefined;
        },
        onError(err: unknown) {
            logger.error('Failed rendering captcha', { error: err });
            setIsUnavailable(true);
        },
    }), [providerType]);

    return (
        <div className={styles.captchaContainer}>
            {!resolved && !isUnavailable && (
                <div className={styles.captchaLoader}>
                    <ComponentLoader />
                </div>
            )}

            {isUnavailable ? (
                <div className={formStyles.fieldError} role="alert">
                    <Message
                        key="captchaUnavailable"
                        defaultMessage="Failed to load the captcha. Please, reload the page or try later."
                    />
                </div>
            ) : (
                <div
                    className={clsx(
                        styles.captcha,
                        styles[`${skin}Captcha`],
                        {
                            [styles[`${providerType}Captcha`]]: providerType,
                        },
                        className,
                    )}
                >
                    {resolved && (
                        <resolved.provider.Component
                            ref={widgetRef}
                            params={resolved.params}
                            skin={skin}
                            color={color}
                            lang={locale}
                            {...callbacks}
                        />
                    )}
                </div>
            )}

            <FormError error={error || propsError} />
        </div>
    );
});

Captcha.displayName = 'Captcha';

export default Captcha;
