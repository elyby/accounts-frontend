// @flow
import React from 'react';

import classNames from 'classnames';

import styles from './stepper.scss';

export default function Stepper({
    totalSteps,
    activeStep
} : {
    totalSteps: number,
    activeStep: number
}) {
    return (
        <div className={styles.steps}>
            {(new Array(totalSteps)).fill(0).map((_, step) => (
                <div className={classNames(styles.step, {
                    [styles.activeStep]: step <= activeStep
                })} key={step} />
            ))}
        </div>
    );
}
