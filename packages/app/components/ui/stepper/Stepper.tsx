import React from 'react';
import clsx from 'clsx';
import { Color, COLOR_GREEN } from 'app/components/ui';

import styles from './stepper.scss';

export default function Stepper({
    totalSteps,
    activeStep,
    color = COLOR_GREEN,
}: {
    totalSteps: number;
    activeStep: number;
    color?: Color;
}) {
    return (
        <div className={clsx(styles.steps, styles[`${color}Steps`])}>
            {new Array(totalSteps).fill(0).map((_, step) => (
                <div
                    className={clsx(styles.step, {
                        [styles.activeStep]: step <= activeStep,
                    })}
                    key={step}
                />
            ))}
        </div>
    );
}
