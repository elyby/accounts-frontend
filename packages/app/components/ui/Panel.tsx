import React, { FC, PropsWithChildren, useState, useCallback } from 'react';
import clsx from 'clsx';

import styles from './panel.scss';
import icons from './icons.scss';

interface PanelProps extends PropsWithChildren<any> {
    title?: string;
    icon?: string;
}

export const Panel: FC<PanelProps> = ({ title, icon, children }) => {
    return (
        <div className={styles.panel}>
            {title && (
                <PanelHeader>
                    {icon && (
                        <button className={styles.headerControl}>
                            <span className={icons[icon]} />
                        </button>
                    )}
                    {title}
                </PanelHeader>
            )}

            {children}
        </div>
    );
};

export const PanelHeader: FC<PropsWithChildren<any>> = ({ children }) => {
    return (
        <div className={styles.header} data-testid="auth-header">
            {children}
        </div>
    );
};

export const PanelBody: FC<PropsWithChildren<any>> = ({ children }) => {
    return (
        <div className={styles.body} data-testid="auth-body">
            {children}
        </div>
    );
};

export const PanelFooter: FC<PropsWithChildren<any>> = ({ children }) => {
    return (
        <div className={styles.footer} data-testid="auth-controls">
            {children}
        </div>
    );
};

interface PanelBodyHeaderProps extends PropsWithChildren<any> {
    type?: 'default' | 'error';
    onClose?: () => void;
}

export const PanelBodyHeader: FC<PanelBodyHeaderProps> = ({ type = 'default', onClose, children }) => {
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const handleCloseClick = useCallback(() => {
        setIsClosed(true);
        onClose?.();
    }, [onClose]);

    return (
        <div
            className={clsx({
                [styles.defaultBodyHeader]: type === 'default',
                [styles.errorBodyHeader]: type === 'error',
                [styles.isClosed]: isClosed,
            })}
        >
            {type === 'error' && <span className={styles.close} onClick={handleCloseClick} />}
            {children}
        </div>
    );
};

interface PanelIconProps {
    icon: string;
}

export const PanelIcon: FC<PanelIconProps> = ({ icon }) => {
    return (
        <div className={styles.panelIcon}>
            <span className={icons[icon]} />
        </div>
    );
};
