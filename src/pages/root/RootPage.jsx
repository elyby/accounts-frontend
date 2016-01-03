import React from 'react';

import { Link } from 'react-router';

import UserBar from 'components/userBar/UserBar';

import styles from './root.scss';

export default function RootPage(props) {
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <Link to="/">
                            Ely.by
                        </Link>
                    </div>
                    <div className={styles.userbar}>
                        <UserBar />
                    </div>
                </div>
            </div>
            <div className={styles.body}>
                {props.children}
            </div>
        </div>
    );
}
