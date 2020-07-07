import React, { ComponentType, MouseEventHandler, ReactNode } from 'react';
import clsx from 'clsx';

import styles from './popup.scss';

interface Props {
    title: ReactNode;
    wrapperClassName?: string;
    popupClassName?: string;
    bodyClassName?: string;
    isClosable?: boolean;
    onClose?: MouseEventHandler<HTMLSpanElement>;
}

const Popup: ComponentType<Props> = ({
    title,
    wrapperClassName,
    popupClassName,
    bodyClassName,
    isClosable = true,
    onClose,
    children,
    ...props // Passthrough the data-params for testing purposes
}) => (
    <div className={clsx(styles.popupWrapper, wrapperClassName)} {...props}>
        <div className={clsx(styles.popup, popupClassName)}>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>{title}</h2>
                {isClosable ? <span className={styles.close} onClick={onClose} data-testid="popup-close" /> : ''}
            </div>

            <div className={clsx(styles.body, bodyClassName)}>{children}</div>
        </div>
    </div>
);

export default Popup;
