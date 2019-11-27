// @flow
import type { Skin } from 'components/ui';
import React from 'react';
import classNames from 'classnames';

import styles from './componentLoader.scss';

export default function ComponentLoader({ skin }: { skin: Skin }) {
  return (
    <div
      className={classNames(
        styles.componentLoader,
        styles[`${skin}ComponentLoader`],
      )}
    >
      <div className={styles.spins}>
        {new Array(5).fill(0).map((_, index) => (
          <div
            className={classNames(styles.spin, styles[`spin${index}`])}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

ComponentLoader.defaultProps = {
  skin: 'dark',
};
