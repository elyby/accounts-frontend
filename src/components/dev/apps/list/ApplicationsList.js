// @flow
import type { OauthAppResponse } from 'services/api/oauth';
import React from 'react';
import { restoreScroll } from 'components/ui/scroll/scroll';
import { FormattedMessage as Message } from 'react-intl';
import { LinkButton } from 'components/ui/form';
import { COLOR_GREEN } from 'components/ui';

import messages from '../ApplicationsIndex.intl.json';
import styles from '../applicationsIndex.scss';
import ApplicationItem from './ApplicationItem';

type Props = {
  applications: Array<OauthAppResponse>,
  deleteApp: string => Promise<any>,
  resetApp: (string, boolean) => Promise<any>,
  resetClientId: () => void,
  clientId: ?string,
};

type State = {
  expandedApp: ?string,
};

export default class ApplicationsList extends React.Component<Props, State> {
  state = {
    expandedApp: null,
  };

  appsRefs: { [key: string]: ?HTMLDivElement } = {};

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
            label={messages.addNew}
            color={COLOR_GREEN}
            className={styles.appsListAddNewAppBtn}
          />
        </div>
        <div className={styles.appsListContainer}>
          {applications.map(app => (
            <div
              key={app.clientId}
              ref={elem => {
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

    if (
      clientId &&
      expandedApp !== clientId &&
      applications.some(app => app.clientId === clientId)
    ) {
      requestAnimationFrame(() =>
        this.onTileClick(clientId, { noReset: true }),
      );
    }
  }

  onTileClick = (
    clientId: string,
    { noReset = false }: { noReset?: boolean } = {},
  ) => {
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
