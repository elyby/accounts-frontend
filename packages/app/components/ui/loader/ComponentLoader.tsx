import React, { ComponentType } from 'react';
import clsx from 'clsx';

import { Skin } from 'app/components/ui';

import styles from './componentLoader.scss';

// TODO: add mode to not show loader until first ~150ms

interface Props {
    skin?: Skin;
}

const ComponentLoader: ComponentType<Props> = ({ skin = 'dark' }) => (
    <div className={clsx(styles.componentLoader, styles[`${skin}ComponentLoader`])}>
        <div className={styles.spins}>
            {new Array(5).fill(0).map((_, index) => (
                <div className={clsx(styles.spin, styles[`spin${index}`])} key={index} />
            ))}
        </div>
    </div>
);

export default ComponentLoader;
