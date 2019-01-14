// @flow
import type { OauthAppResponse } from 'services/api/oauth';
import React, { Component } from 'react';
import classNames from 'classnames';
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
    resetClientId: () => void, // notify parent to remove clientId from current location.href
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
            clientId,
            resetClientId
        } = this.props;

        if (applications.length > 0) {
            return (
                <ApplicationsList
                    applications={applications}
                    resetApp={resetApp}
                    deleteApp={deleteApp}
                    clientId={clientId}
                    resetClientId={resetClientId}
                />
            );
        } else if (displayForGuest) {
            return <Guest />;
        }

        return <Loader noApps={!isLoading} />;
    }
}

function Loader({ noApps }: { noApps: bool }) {
    return (
        <div className={styles.emptyState} data-e2e={noApps ? 'noApps' : 'loading'}>
            <img
                src={noApps ? cubeIcon : loadingCubeIcon}
                className={styles.emptyStateIcon}
            />

            <div className={classNames(styles.noAppsContainer, {
                [styles.noAppsAnimating]: noApps
            })}>
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
                    data-e2e="newApp"
                    label={messages.addNew}
                    color={COLOR_GREEN}
                    className={styles.emptyStateActionButton}
                />
            </div>
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
