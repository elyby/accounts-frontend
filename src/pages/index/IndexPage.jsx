import React, { Component } from 'react';

import { connect } from 'react-redux';

import { Profile } from 'components/profile/Profile';

class IndexPage extends Component {
    displayName = 'IndexPage';

    render() {
        return (<Profile {...this.props} />);
    }
}

export default connect((state) => ({
    user: state.user
}))(IndexPage);
