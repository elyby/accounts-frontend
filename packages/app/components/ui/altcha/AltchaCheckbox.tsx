import React, { FC, useEffect, useRef, useState } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Motion, OpaqueConfig, spring } from 'react-motion';
import clsx from 'clsx';

import type { Color, Skin } from 'app/components/ui';

import Checkbox from '../form/Checkbox';
import styles from './altcha.scss';
import WorldGeneration, { MAP_SIZE } from './WorldGeneration';

export type AltchaState = 'idle' | 'verifying' | 'verified' | 'error';

/**
 * The visual phase, which lags behind the state:
 * - checkbox: the plain checkbox;
 * - generating: the checkbox has grown into the world generation map;
 * - shrinking: the map shoots back into the checkbox, when the generation is completed, or the verification failed.
 */
type Phase = 'checkbox' | 'generating' | 'shrinking';

const CHECKBOX_SIZE = 22;

/**
 * While growing, the map appears from the checkbox, until its size exceeds the checkbox's one by this range
 */
const CROSSFADE_RANGE = 24;

/**
 * The shrinking is too fast to dissolve the map depending on its size, so it's dissolved by the time
 */
const SHRINK_CROSSFADE = 'opacity 300ms ease-out';

const GROW_SPRING = { stiffness: 170, damping: 18 };

// The low damping makes the overshoot, so the map "shoots" into the checkbox
const SHRINK_SPRING = { stiffness: 300, damping: 15 };

/**
 * The pause between the generation's completion and the shot, so the generated checkmark can be seen
 */
const SHOT_DELAY = 250;

interface Props {
    state: AltchaState;
    /**
     * The verification's progress from 0 to 1
     */
    progress: number;
    skin: Skin;
    color: Color;
    onVerify(): void;
}

const AltchaCheckbox: FC<Props> = ({ state, progress, skin, color, onVerify }) => {
    const [phase, setPhase] = useState<Phase>('checkbox');
    // The simulation never goes back, so every attempt gets a new map
    const [attempt, setAttempt] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (state === 'verifying') {
            setPhase('generating');
            setAttempt((value) => value + 1);
        } else if (state === 'error') {
            setPhase((value) => (value === 'checkbox' ? value : 'shrinking'));
        } else if (state === 'idle') {
            // The reset or the expiration: back to the plain checkbox without the animation
            setPhase('checkbox');
        }

        // The shot's timer belongs to the verified state only
        return () => clearTimeout(timerRef.current);
    }, [state]);

    let label: React.ReactElement;

    // The verified label waits for the end of the generation
    if (state === 'verifying' || (state === 'verified' && phase === 'generating')) {
        label = <Message key="verifying" defaultMessage="Generating…" />;
    } else if (state === 'verified') {
        label = <Message key="verified" defaultMessage="You are verified" />;
    } else if (state === 'error') {
        label = <Message key="failed" defaultMessage="Verification failed. Try again" />;
    } else {
        label = <Message key="notARobot" defaultMessage="I’m not a creeper" />;
    }

    let targetSize: number | OpaqueConfig = CHECKBOX_SIZE;

    if (phase === 'generating') {
        targetSize = spring(MAP_SIZE, GROW_SPRING);
    } else if (phase === 'shrinking') {
        targetSize = spring(CHECKBOX_SIZE, SHRINK_SPRING);
    }

    return (
        <label
            className={clsx(styles.altcha, styles[`${state}Altcha`], styles[`${skin}Altcha`], styles[`${color}Altcha`])}
            data-testid="altcha"
            data-state={state}
        >
            <Motion
                style={{ size: targetSize }}
                onRest={() => {
                    if (phase === 'shrinking') {
                        setPhase('checkbox');
                    }
                }}
            >
                {({ size }) => {
                    const isShrinking = phase === 'shrinking';
                    const mapOpacity = isShrinking
                        ? 0
                        : Math.min(1, Math.max(0, (size - CHECKBOX_SIZE) / CROSSFADE_RANGE));
                    let checkboxOpacity = 1 - mapOpacity;

                    if (isShrinking) {
                        // The checkbox is shown at once, and only the map dissolves over it
                        checkboxOpacity = 1;
                    } else if (phase === 'generating' && state === 'verified') {
                        // The fast solution comes, while the map is still growing. The checked checkbox
                        // mustn't flash through the map, it'll be shown by the shot
                        checkboxOpacity = 0;
                    }

                    return (
                        <span className={styles.mark} style={{ width: size, height: size }}>
                            {/* The checkbox is always there and scales along with the map */}
                            <span className={styles.markLayer} style={{ opacity: checkboxOpacity }}>
                                <span style={{ display: 'flex', transform: `scale(${size / CHECKBOX_SIZE})` }}>
                                    <Checkbox
                                        color={color}
                                        checked={state === 'verified'}
                                        disabled={state === 'verifying'}
                                        onChange={() => {
                                            // The verified state can't be undone by the user: the token stays
                                            // until it's used or expired
                                            if (state !== 'verified') {
                                                onVerify();
                                            }
                                        }}
                                    />
                                </span>
                            </span>

                            {phase !== 'checkbox' && (
                                <WorldGeneration
                                    key={attempt}
                                    progress={progress}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: size,
                                        height: size,
                                        opacity: mapOpacity,
                                        transition: isShrinking ? SHRINK_CROSSFADE : 'none',
                                    }}
                                    onComplete={() => {
                                        timerRef.current = setTimeout(() => setPhase('shrinking'), SHOT_DELAY);
                                    }}
                                />
                            )}
                        </span>
                    );
                }}
            </Motion>
            {/* Until the message is translated, the English one is shown in the RTL languages too,
                where its trailing ellipsis would jump to the beginning */}
            <span className={styles.label} dir="auto">
                {label}
            </span>
        </label>
    );
};

export default AltchaCheckbox;
