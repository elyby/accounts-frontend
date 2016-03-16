import React, { Component } from 'react';

import { connect } from 'react-redux';

import ProfilePage from 'pages/profile/ProfilePage';

class IndexPage extends Component {
    displayName = 'IndexPage';

    render() {
        return (
            <div>
                <ProfilePage {...this.props} />
            </div>
        );
    }
}

export default connect((state) => ({
    user: state.user
}))(IndexPage);
