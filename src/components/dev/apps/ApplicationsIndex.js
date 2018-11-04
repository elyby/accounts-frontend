// @flow
import type { Node } from 'react';
import type { OauthAppResponse } from 'services/api/oauth';
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet';
import { LinkButton } from 'components/ui/form';
import { COLOR_GREEN, COLOR_BLUE } from 'components/ui';
import { ContactLink } from 'components/contact';

import styles from './applicationsIndex.scss';
import messages from './ApplicationsIndex.intl.json';
import cubeIcon from './icons/cube.svg';
import loadingCubeIcon from './icons/loading-cube.svg';
import toolsIcon from './icons/tools.svg';
import ApplicationsList from './list';

type Props = {
    clientId?: ?string,
    displayForGuest: bool,
    applications: Array<OauthAppResponse>,
    isLoading: bool,
    deleteApp: string => Promise<any>,
    resetApp: (string, bool) => Promise<any>
};

export default class ApplicationsIndex extends Component<Props> {
    render() {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeContainer}>
                    <Message {...messages.accountsForDevelopers}>
                        {(pageTitle: string) => (
                            <h2 className={styles.welcomeTitle}>
                                <Helmet title={pageTitle} />
                                {pageTitle}
                            </h2>
                        )}
                    </Message>
                    <div className={styles.welcomeTitleDelimiter} />
                    <div className={styles.welcomeParagraph}>
                        <Message
                            {...messages.accountsAllowsYouYoUseOauth2}
                            values={{
                                ourDocumentation: (
                                    <a
                                        href="http://docs.ely.by/oauth.html"
                                        target="_blank"
                                    >
                                        <Message
                                            {...messages.ourDocumentation}
                                        />
                                    </a>
                                )
                            }}
                        />
                    </div>
                    <div className={styles.welcomeParagraph}>
                        <Message
                            {...messages.ifYouHaveAnyTroubles}
                            values={{
                                feedback: (
                                    <ContactLink>
                                        <Message {...messages.feedback} />
                                    </ContactLink>
                                )
                            }}
                        />
                    </div>
                </div>

                {this.getContent()}
            </div>
        );
    }

    getContent() {
        const {
            displayForGuest,
            applications,
            isLoading,
            resetApp,
            deleteApp,
            clientId
        } = this.props;

        if (displayForGuest) {
            return <Guest />;
        } else if (isLoading) {
            return <Loader />;
        } else if (applications.length > 0) {
            return (
                <ApplicationsList
                    applications={applications}
                    resetApp={resetApp}
                    deleteApp={deleteApp}
                    clientId={clientId}
                />
            );
        }

        return <NoApps />;
    }
}

function Loader() {
    return (
        <div className={styles.emptyState}>
            <img src={loadingCubeIcon} className={styles.loadingStateIcon} />
        </div>
    );
}

function Guest() {
    return (
        <div className={styles.emptyState}>
            <img src={toolsIcon} className={styles.emptyStateIcon} />
            <div className={styles.emptyStateText}>
                <div>
                    <Message {...messages.weDontKnowAnythingAboutYou} />
                </div>
                <div>
                    <Message {...messages.youMustAuthToBegin} />
                </div>
            </div>

            <LinkButton
                to="/login"
                label={messages.authorization}
                color={COLOR_BLUE}
                className={styles.emptyStateActionButton}
            />
        </div>
    );
}

function NoApps() {
    return (
        <div className={styles.emptyState}>
            <img src={cubeIcon} className={styles.emptyStateIcon} />
            <div className={styles.emptyStateText}>
                <div>
                    <Message {...messages.youDontHaveAnyApplication} />
                </div>
                <div>
                    <Message {...messages.shallWeStart} />
                </div>
            </div>

            <LinkButton
                to="/dev/applications/new"
                label={messages.addNew}
                color={COLOR_GREEN}
                className={styles.emptyStateActionButton}
            />
        </div>
    );
}
