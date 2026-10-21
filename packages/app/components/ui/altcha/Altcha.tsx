import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import type { CaptchaComponentHandle, CaptchaComponentProps } from 'app/services/captcha/types';
import defaultVerify, { type Verifier } from 'app/services/captcha/providers/altcha/verify';
import logger from 'app/services/logger';

import AltchaCheckbox, { AltchaState } from './AltchaCheckbox';

/**
 * The token is considered expired a bit earlier than the backend will reject it,
 * so the form submission has time to reach the backend
 */
export const EXPIRATION_MARGIN = 30_000;

const MAX_TIMEOUT = 2 ** 31 - 1;

interface Props extends CaptchaComponentProps {
    /**
     * Requests and solves a challenge. Replaceable for tests and storybooks
     */
    verify?: Verifier;
}

const Altcha = forwardRef<CaptchaComponentHandle, Props>(({ params, skin, color, onSetCode, onExpire, verify = defaultVerify }, ref) => {
    const [state, setState] = useState<AltchaState>('idle');
    const [progress, setProgress] = useState(0);

    const controllerRef = useRef<AbortController>();
    const expirationTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // The callbacks are read through the refs, so their identity changes don't restart the verification
    const callbacksRef = useRef({ onSetCode, onExpire });
    callbacksRef.current = { onSetCode, onExpire };

    const cancel = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = undefined;
        clearTimeout(expirationTimerRef.current);
    }, []);

    useImperativeHandle(ref, () => ({
        reset() {
            cancel();
            setState('idle');
        },
    }), [cancel]);

    useEffect(() => cancel, [cancel]);

    const startVerification = useCallback(async () => {
        cancel();

        const controller = new AbortController();
        controllerRef.current = controller;
        setState('verifying');
        setProgress(0);

        try {
            // The aborted verification doesn't report the progress anymore
            const { token, expiresAt } = await verify(String(params.challengeUrl), controller.signal, setProgress);

            if (controller.signal.aborted) {
                return;
            }

            callbacksRef.current.onSetCode(token);
            setState('verified');
            setProgress(1);

            expirationTimerRef.current = setTimeout(
                () => {
                    callbacksRef.current.onExpire();
                    setState('idle');
                },
                // Delays longer than the 32-bit signed int make the timer fire immediately
                Math.min(MAX_TIMEOUT, Math.max(0, expiresAt - Date.now() - EXPIRATION_MARGIN)),
            );
        } catch (error) {
            if (controller.signal.aborted) {
                return;
            }

            logger.warn('ALTCHA verification failed', { error });
            setState('error');
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = undefined;
            }
        }
    }, [cancel, verify, params.challengeUrl]);

    return (
        <AltchaCheckbox
            state={state}
            progress={progress}
            skin={skin}
            color={color}
            onVerify={startVerification}
        />
    );
});

Altcha.displayName = 'Altcha';

export default Altcha;
