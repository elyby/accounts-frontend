import React from 'react';
import clsx from 'clsx';

import styles from './instructions.scss';

export default function OsInstruction({
  className,
  logo,
  label,
  onClick,
}: {
  className: string;
  logo: string;
  label: string;
  onClick: (event: React.MouseEvent<any>) => void;
}) {
  return (
    <div
      className={clsx(styles.osTile, className)}
      onClick={onClick}
      data-testid="os-tile"
    >
      <img className={styles.osLogo} src={logo} alt={label} />
      <div className={styles.osName}>{label}</div>
    </div>
  );
}
