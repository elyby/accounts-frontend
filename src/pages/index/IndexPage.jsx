import React, { Component } from 'react';

import { connect } from 'react-redux';

import ProfilePage from 'pages/profile/ProfilePage';

import authFlow from 'services/authFlow';

class IndexPage extends Component {
    displayName = 'IndexPage';

    componentWillMount() {
        if (this.props.user.isGuest) {
            authFlow.login();
        }
    }

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
