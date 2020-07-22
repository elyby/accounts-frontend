import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { connect } from 'app/functions';
import { fetchAvailableApps, resetApp, deleteApp } from 'app/components/dev/apps/actions';
import ApplicationsIndex from 'app/components/dev/apps/ApplicationsIndex';
import { User } from 'app/components/user';
import { OauthAppResponse } from 'app/services/api/oauth';

interface Props extends RouteComponentProps {
    user: User;
    apps: OauthAppResponse[];
    fetchAvailableApps: () => Promise<void>;
    deleteApp: (clientId: string) => Promise<void>;
    resetApp: (clientId: string, resetClientSecret: boolean) => Promise<void>;
}

type State = {
    isLoading: boolean;
    forceUpdate: boolean;
};

class ApplicationsListPage extends React.Component<Props, State> {
    state = {
        isLoading: false,
        forceUpdate: false,
    };

    componentDidMount() {
        !this.props.user.isGuest && this.loadApplicationsList();
    }

    componentDidUpdate({ user }: Props) {
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

export default connect(
    (state) => ({
        user: state.user,
        apps: state.apps.available,
    }),
    {
        fetchAvailableApps,
        resetApp,
        deleteApp,
    },
)(ApplicationsListPage);
