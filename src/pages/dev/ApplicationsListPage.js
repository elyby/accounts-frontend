// @flow
import React, { Component } from 'react';

import ApplicationsIndex from 'components/dev/apps/ApplicationsIndex';

import type { User } from 'components/user';
import type { OauthAppResponse } from 'services/api/oauth';

class ApplicationsListPage extends Component<{
    user: User,
    apps: Array<OauthAppResponse>,
    fetchAvailableApps: () => Promise<*>,
    deleteApp: (string) => Promise<*>,
    resetApp: (string, bool) => Promise<*>,
}, {
    isLoading: bool,
}> {
    static displayName = 'ApplicationsListPage';

    state = {
        appsList: [],
        isLoading: false,
    };

    componentWillMount() {
        !this.props.user.isGuest && this.loadApplicationsList();
    }

    render() {
        const { user, apps, resetApp, deleteApp } = this.props;
        const { isLoading } = this.state;

        return (
            <ApplicationsIndex
                displayForGuest={user.isGuest}
                applications={apps}
                isLoading={isLoading}
                deleteApp={deleteApp}
                resetApp={resetApp}
            />
        );
    }

    loadApplicationsList = async () => {
        this.setState({isLoading: true});
        await this.props.fetchAvailableApps();
        this.setState({isLoading: false});
    };
}

import { connect } from 'react-redux';
import { fetchAvailableApps, resetApp, deleteApp } from 'components/dev/apps/actions';

export default connect((state) => ({
    user: state.user,
    apps: state.apps.available,
}), {
    fetchAvailableApps,
    resetApp,
    deleteApp,
})(ApplicationsListPage);
