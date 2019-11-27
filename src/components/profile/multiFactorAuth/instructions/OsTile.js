// @flow
import React from 'react';

import classNames from 'classnames';

import styles from './instructions.scss';

export default function OsInstruction({
  className,
  logo,
  label,
  onClick,
}: {
  className: string,
  logo: string,
  label: string,
  onClick: (event: MouseEvent) => void,
}) {
  return (
    <div className={classNames(styles.osTile, className)} onClick={onClick}>
      <img className={styles.osLogo} src={logo} alt={label} />
      <div className={styles.osName}>{label}</div>
    </div>
  );
}
