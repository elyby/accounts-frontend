import React, { ComponentType } from 'react';
import clsx from 'clsx';

import styles from './pseudoAvatar.scss';

interface Props {
    index?: number;
    className?: string;
}

const PseudoAvatar: ComponentType<Props> = ({ index = 0, className }) => (
    <div className={clsx(styles.pseudoAvatar, styles[`pseudoAvatar${index % 7}`], className)} />
);

export default PseudoAvatar;
