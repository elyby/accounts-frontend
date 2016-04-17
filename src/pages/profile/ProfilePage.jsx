import React, { Component } from 'react';

import styles from './profile.scss';

export default class ProfilePage extends Component {
    displayName = 'ProfilePage';

    render() {
        return (
            <div className={styles.container}>
                {this.props.children}
            </div>
        );
    }
}
