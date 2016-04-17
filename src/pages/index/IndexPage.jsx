import React, { Component } from 'react';

import { connect } from 'react-redux';

import ProfilePage from 'pages/profile/ProfilePage';
import Profile from 'components/profile/Profile';

class IndexPage extends Component {
    displayName = 'IndexPage';

    render() {
        return (
            <ProfilePage>
                <Profile {...this.props} />
            </ProfilePage>
        );
    }
}

export default connect((state) => ({
    user: state.user
}))(IndexPage);
