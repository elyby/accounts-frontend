import React, { Component } from 'react';

import { connect } from 'react-redux';

import authFlow from 'services/authFlow';

class IndexPage extends Component {
    displayName = 'IndexPage';

    componentWillMount() {
        if (this.props.user.isGuest) {
            authFlow.login();
        }
    }

    render() {
        const {user, children} = this.props;

        return (
            <div>
                <h1>
                    Hello {user.username}!
                </h1>
                {children}
            </div>
        );
    }
}

export default connect((state) => ({
    user: state.user
}))(IndexPage);
