import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';

import { Category } from 'components/profile/Category';

import styles from './profile.scss';

class ProfilePage extends Component {
    static displayName = 'AuthPage';
    static propTypes = {
        /*client: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired
        })*/
    };

    state = {
    };

    render() {
        return (
            <div className={styles.content}>
                <Category {...this.props} />
            </div>
        );
    }
}

export default connect((state) => ({
    //client: state.auth.client
}))(ProfilePage);
