import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';

import { logout } from 'components/auth/actions';

class Logout extends Component {
    static displayName = 'Logout';

    static propTypes = {
        logout: PropTypes.func.isRequired
    };

    componentWillMount() {
        this.props.logout();
    }

    render() {
        return <span />;
    }
}

export default connect(null, {
    logout
})(Logout);
