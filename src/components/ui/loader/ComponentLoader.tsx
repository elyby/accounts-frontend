import React from 'react';
import classNames from 'classnames';
import { Skin } from 'components/ui';

import styles from './componentLoader.scss';

function ComponentLoader({ skin = 'dark' }: { skin?: Skin }) {
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

export default ComponentLoader;
