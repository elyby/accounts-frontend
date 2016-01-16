import React, { Component } from 'react';

import AuthPage from 'pages/auth/AuthPage';
import Login from 'components/auth/Login';

export default class IndexPage extends Component {
    displayName = 'IndexPage';

    render() {
        return (
            <AuthPage>
                <Login />
            </AuthPage>
        );
    }
}
