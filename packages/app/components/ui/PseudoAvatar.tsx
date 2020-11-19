import React, { ComponentType } from 'react';
import clsx from 'clsx';

import styles from './pseudoAvatar.scss';

interface Props {
    index?: number;
    deleted?: boolean;
    className?: string;
}

const PseudoAvatar: ComponentType<Props> = ({ index = 0, deleted, className }) => (
    <div
        className={clsx(
            styles.pseudoAvatarWrapper,
            {
                [styles.deletedPseudoAvatar]: deleted,
            },
            className,
        )}
    >
        <div className={clsx(styles.pseudoAvatar, styles[`pseudoAvatar${index % 7}`])} />
        {deleted ? <div className={styles.deletedIcon} /> : ''}
    </div>
);

export default PseudoAvatar;
