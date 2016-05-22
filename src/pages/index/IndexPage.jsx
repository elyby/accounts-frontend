import React, { Component } from 'react';

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

import { connect } from 'react-redux';

export default connect((state) => ({
    user: state.user
}))(IndexPage);
