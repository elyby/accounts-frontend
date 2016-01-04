import React from 'react';

import { Link } from 'react-router';

import Userbar from 'components/userbar/Userbar';

import styles from './root.scss';

export default function RootPage(props) {
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Link to="/" className={styles.logo}>
                        Ely.by
                    </Link>
                    <div className={styles.userbar}>
                        <Userbar />
                    </div>
                </div>
            </div>
            <div className={styles.body}>
                {props.children}
            </div>
        </div>
    );
}
