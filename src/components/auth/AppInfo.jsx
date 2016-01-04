import React, { Component } from 'react';

import styles from './appInfo.scss';

export default class SignIn extends Component {
    render() {
        var { name, description } = this.props;

        return (
            <div className={styles.appInfo}>
                <div className={styles.logoContainer}>
                    <h2 className={styles.logo}>{name}</h2>
                </div>
                <div className={styles.descriptionContainer}>
                    <p className={styles.description}>
                        {description}
                    </p>
                </div>
            </div>
        );
    }
}
