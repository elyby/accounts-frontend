import React, { FC, useRef } from 'react';
import { action } from '@storybook/addon-actions';
import clsx from 'clsx';

import { Color, Skin } from 'app/components/ui';
import type { CaptchaComponentHandle } from 'app/services/captcha/types';
import type { Verifier } from 'app/services/captcha/providers/altcha/verify';

import Button from '../form/Button';
import captchaStyles from '../form/captcha.scss';
import Altcha from './Altcha';
import AltchaCheckbox, { AltchaState } from './AltchaCheckbox';

export default { title: 'UI/ALTCHA' };

const STATES: ReadonlyArray<AltchaState> = ['idle', 'verifying', 'verified', 'error'];

const PARAMS = { challengeUrl: '/api/captcha/altcha/challenge' };

/**
 * The fake solution is found, when 60% of the counter's possible values are checked
 */
const FAKE_SOLUTION_PROGRESS = 0.6;

/**
 * The progress of the static verifying state
 */
const STATIC_PROGRESS = 0.4;

/**
 * Reproduces the Captcha component's frame, so the widget looks like in the real forms
 */
const Frame: FC<{ skin: Skin; children: React.ReactNode }> = ({ skin, children }) => (
    <div
        style={{
            boxSizing: 'content-box',
            width: 302,
            padding: 15,
            marginBottom: 10,
            background: skin === 'dark' ? '#232323' : '#fff',
        }}
    >
        <div className={clsx(captchaStyles.captcha, captchaStyles[`${skin}Captcha`])}>{children}</div>
    </div>
);

const States: FC<{ skin: Skin; color: Color }> = ({ skin, color }) => (
    <div>
        <h3>{color}</h3>
        {STATES.map((state) => (
            <Frame key={state} skin={skin}>
                <AltchaCheckbox
                    state={state}
                    progress={state === 'verifying' ? STATIC_PROGRESS : 0}
                    skin={skin}
                    color={color}
                    onVerify={action('onVerify')}
                />
            </Frame>
        ))}
    </div>
);

export const DarkSkin = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <States skin="dark" color="green" />
        <States skin="dark" color="blue" />
        <States skin="dark" color="lightViolet" />
    </div>
);
DarkSkin.storyName = 'Dark skin states';

export const LightSkin = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <States skin="light" color="green" />
        <States skin="light" color="blue" />
    </div>
);
LightSkin.storyName = 'Light skin states';

function createFakeVerifier({ duration, fail = false }: { duration: number; fail?: boolean }): Verifier {
    return (challengeUrl, signal, onProgress) =>
        new Promise((resolve, reject) => {
            action('verify')(challengeUrl);

            const startedAt = Date.now();
            const progressTimer = setInterval(() => {
                onProgress?.(((Date.now() - startedAt) / duration) * FAKE_SOLUTION_PROGRESS);
            }, 100);

            const timer = setTimeout(() => {
                clearInterval(progressTimer);

                if (fail) {
                    reject(new Error('Fake verification failure'));
                } else {
                    // Expires in 1 minute, i.e. 30 seconds after the verification with the expiration margin
                    resolve({ token: 'fake-altcha-token', expiresAt: Date.now() + 60_000 });
                }
            }, duration);

            signal.addEventListener('abort', () => {
                clearTimeout(timer);
                clearInterval(progressTimer);
                action('aborted')();
            });
        });
}

const Interactive: FC<{ verify: Verifier }> = ({ verify }) => {
    const ref = useRef<CaptchaComponentHandle>(null);

    return (
        <>
            <Frame skin="dark">
                <Altcha
                    ref={ref}
                    params={PARAMS}
                    skin="dark"
                    color="green"
                    lang="en"
                    verify={verify}
                    onSetCode={action('onSetCode')}
                    onExpire={action('onExpire')}
                    onError={action('onError')}
                />
            </Frame>
            <Button small onClick={() => ref.current?.reset()}>
                Reset (e.g. after the invalid form submission)
            </Button>
        </>
    );
};

export const Success = () => <Interactive verify={createFakeVerifier({ duration: 1500 })} />;
Success.storyName = 'Interactive: success';

export const SlowDevice = () => <Interactive verify={createFakeVerifier({ duration: 8000 })} />;
SlowDevice.storyName = 'Interactive: slow device';

export const Failure = () => <Interactive verify={createFakeVerifier({ duration: 1000, fail: true })} />;
Failure.storyName = 'Interactive: failure';
