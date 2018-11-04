// @flow
import type { Location, RouterHistory } from 'react-router';
import type { User } from 'components/user';
import type { OauthAppResponse } from 'services/api/oauth';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    fetchAvailableApps,
    resetApp,
    deleteApp
} from 'components/dev/apps/actions';
import ApplicationsIndex from 'components/dev/apps/ApplicationsIndex';

class ApplicationsListPage extends Component<
    {
        location: Location,
        history: RouterHistory,
        user: User,
        apps: Array<OauthAppResponse>,
        fetchAvailableApps: () => Promise<void>,
        deleteApp: string => Promise<void>,
        resetApp: (string, bool) => Promise<void>
    },
    {
        isLoading: bool
    }
> {
    state = {
        isLoading: false
    };

    componentDidMount() {
        !this.props.user.isGuest && this.loadApplicationsList();
    }

    render() {
        const { user, apps, resetApp, deleteApp, location } = this.props;
        const { isLoading } = this.state;
        const clientId = location.hash.substr(1) || null;

        return (
            <ApplicationsIndex
                displayForGuest={user.isGuest}
                applications={apps}
                isLoading={isLoading}
                deleteApp={deleteApp}
                resetApp={resetApp}
                clientId={clientId}
                resetClientId={this.resetClientId}
            />
        );
    }

    loadApplicationsList = async () => {
        this.setState({ isLoading: true });
        await this.props.fetchAvailableApps();
        this.setState({ isLoading: false });
    };

    resetClientId = () => {
        const { history, location } = this.props;

        if (location.hash) {
            history.push({ ...location, hash: '' });
        }
    };
}

export default connect(
    (state) => ({
        user: state.user,
        apps: state.apps.available
    }),
    {
        fetchAvailableApps,
        resetApp,
        deleteApp
    }
)(ApplicationsListPage);
