import React from 'react';
import { FormattedMessage as Message } from 'react-intl';

import { restoreScroll } from 'app/components/ui/scroll/scroll';
import { LinkButton } from 'app/components/ui/form';
import { COLOR_GREEN } from 'app/components/ui';
import { OauthAppResponse } from 'app/services/api/oauth';

import messages from '../list.intl';
import styles from '../applicationsIndex.scss';
import ApplicationItem from './ApplicationItem';

interface Props {
    applications: OauthAppResponse[];
    deleteApp: (clientId: string) => Promise<any>;
    resetApp: (clientId: string, resetClientSecret: boolean) => Promise<any>;
    resetClientId: () => void;
    clientId: string | null;
}

interface State {
    expandedApp: string | null;
}

export default class ApplicationsList extends React.Component<Props, State> {
    state = {
        expandedApp: null,
    };

    appsRefs: Record<string, HTMLDivElement | null> = {};

    componentDidMount() {
        this.checkForActiveApp();
    }

    componentDidUpdate() {
        this.checkForActiveApp();
    }

    render() {
        const { applications, resetApp, deleteApp } = this.props;
        const { expandedApp } = this.state;

        return (
            <div>
                <div className={styles.appsListTitleContainer}>
                    <div className={styles.appsListTitle}>
                        <Message {...messages.yourApplications} />
                    </div>
                    <LinkButton
                        to="/dev/applications/new"
                        data-e2e="newApp"
                        color={COLOR_GREEN}
                        className={styles.appsListAddNewAppBtn}
                    >
                        <Message {...messages.addNew} />
                    </LinkButton>
                </div>
                <div className={styles.appsListContainer}>
                    {applications.map((app) => (
                        <div
                            key={app.clientId}
                            ref={(elem) => {
                                this.appsRefs[app.clientId] = elem;
                            }}
                        >
                            <ApplicationItem
                                application={app}
                                expand={app.clientId === expandedApp}
                                onTileClick={this.onTileClick}
                                onResetSubmit={resetApp}
                                onDeleteSubmit={deleteApp}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    checkForActiveApp() {
        const { applications, clientId } = this.props;
        const { expandedApp } = this.state;

        if (clientId && expandedApp !== clientId && applications.some((app) => app.clientId === clientId)) {
            requestAnimationFrame(() => this.onTileClick(clientId, { noReset: true }));
        }
    }

    onTileClick = (clientId: string, { noReset = false }: { noReset?: boolean } = {}) => {
        const { clientId: initialClientId, resetClientId } = this.props;
        const expandedApp = this.state.expandedApp === clientId ? null : clientId;

        if (initialClientId && noReset !== true) {
            resetClientId();
        }

        this.setState({ expandedApp }, () => {
            if (expandedApp !== null) {
                // TODO: @SleepWalker: мб у тебя есть идея, как это сделать более правильно и менее дёргано?
                setTimeout(() => restoreScroll(this.appsRefs[clientId]), 150);
            }
        });
    };
}
