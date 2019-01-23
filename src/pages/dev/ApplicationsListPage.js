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

interface Props {
    location: Location;
    history: RouterHistory;
    user: User;
    apps: Array<OauthAppResponse>;
    fetchAvailableApps: () => Promise<void>;
    deleteApp: string => Promise<void>;
    resetApp: (string, bool) => Promise<void>;
}

interface State {
    isLoading: bool;
    forceUpdate: bool;
}

class ApplicationsListPage extends Component<Props, State> {
    state = {
        isLoading: false,
        forceUpdate: false,
    };

    componentDidMount() {
        !this.props.user.isGuest && this.loadApplicationsList();
    }

    componentDidUpdate({ user }) {
        if (this.props.user !== user) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ forceUpdate: true });
            this.loadApplicationsList();
        }
    }

    render() {
        const { user, apps, resetApp, deleteApp, location } = this.props;
        const { isLoading, forceUpdate } = this.state;
        const clientId = location.hash.substr(1) || null;

        return (
            <ApplicationsIndex
                displayForGuest={user.isGuest}
                applications={forceUpdate ? [] : apps}
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
        this.setState({
            isLoading: false,
            forceUpdate: false,
        });
    };

    resetClientId = () => {
        const { history, location } = this.props;

        if (location.hash) {
            history.push({ ...location, hash: '' });
        }
    };
}

export default connect((state) => ({
    user: state.user,
    apps: state.apps.available,
}), {
    fetchAvailableApps,
    resetApp,
    deleteApp,
})(ApplicationsListPage);
