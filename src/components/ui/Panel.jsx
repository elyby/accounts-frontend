import React from 'react';

import styles from './panel.scss';

export function Panel(props) {
    var { title } = props;

    if (title) {
        title = (
            <PanelHeader>
                {title}
            </PanelHeader>
        );
    }

    return (
        <div className={styles.panel}>
            {title}

            {props.children}
        </div>
    );
}

export function PanelHeader(props) {
    return (
        <div className={styles.header}>
            {props.children}
        </div>
    );
}

export function PanelBody(props) {
    return (
        <div className={styles.body}>
            {props.children}
        </div>
    );
}

export function PanelFooter(props) {
    return (
        <div className={styles.footer}>
            {props.children}
        </div>
    );
}
