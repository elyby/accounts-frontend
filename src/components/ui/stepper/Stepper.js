// @flow
import React from 'react';

import classNames from 'classnames';

import { COLOR_GREEN } from 'components/ui';

import styles from './stepper.scss';

import type { Color } from 'components/ui';

export default function Stepper({
  totalSteps,
  activeStep,
  color = COLOR_GREEN,
}: {
  totalSteps: number,
  activeStep: number,
  color?: Color,
}) {
  return (
    <div className={classNames(styles.steps, styles[`${color}Steps`])}>
      {new Array(totalSteps).fill(0).map((_, step) => (
        <div
          className={classNames(styles.step, {
            [styles.activeStep]: step <= activeStep,
          })}
          key={step}
        />
      ))}
    </div>
  );
}
