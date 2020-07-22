import React from 'react';
import clsx from 'clsx';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { LinkButton } from 'app/components/ui/form';
import { COLOR_GREEN, COLOR_BLUE } from 'app/components/ui';
import { ContactLink } from 'app/components/contact';
import { OauthAppResponse } from 'app/services/api/oauth';

import styles from './applicationsIndex.scss';
import cubeIcon from './icons/cube.svg';
import loadingCubeIcon from './icons/loading-cube.svg';
import toolsIcon from './icons/tools.svg';
import ApplicationsList from './list';

const labels = defineMessages({
    addNew: 'Add new',
});

type Props = {
    clientId: string | null;
    resetClientId: () => void; // notify parent to remove clientId from current location.href
    displayForGuest: boolean;
    applications: Array<OauthAppResponse>;
    isLoading: boolean;
    deleteApp: (clientId: string) => Promise<any>;
    resetApp: (clientId: string, resetClientSecret: boolean) => Promise<any>;
};

export default class ApplicationsIndex extends React.Component<Props> {
    render() {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeContainer}>
                    <Message key="accountsForDevelopers" defaultMessage="Ely.by Accounts for developers">
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
                            key="accountsAllowsYouYoUseOauth2"
                            defaultMessage="Ely.by Accounts service provides users with a quick and easy-to-use way to login to your site, launcher or Minecraft server via OAuth2 authorization protocol. You can find more information about integration with Ely.by Accounts in {ourDocumentation}."
                            values={{
                                ourDocumentation: (
                                    <a href="https://docs.ely.by/en/oauth.html" target="_blank">
                                        <Message key="ourDocumentation" defaultMessage="our documentation" />
                                    </a>
                                ),
                            }}
                        />
                    </div>
                    <div className={styles.welcomeParagraph}>
                        <Message
                            key="ifYouHaveAnyTroubles"
                            defaultMessage="If you are experiencing difficulties, you can always use {feedback}. We'll surely help you."
                            values={{
                                feedback: (
                                    <ContactLink>
                                        <Message key="feedback" defaultMessage="feedback" />
                                    </ContactLink>
                                ),
                            }}
                        />
                    </div>
                </div>

                {this.getContent()}
            </div>
        );
    }

    getContent() {
        const { displayForGuest, applications, isLoading, resetApp, deleteApp, clientId, resetClientId } = this.props;

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
        }

        if (displayForGuest) {
            return <Guest />;
        }

        return <Loader noApps={!isLoading} />;
    }
}

function Loader({ noApps }: { noApps: boolean }) {
    return (
        <div className={styles.emptyState} data-e2e={noApps ? 'noApps' : 'loading'}>
            <img src={noApps ? cubeIcon : loadingCubeIcon} className={styles.emptyStateIcon} />

            <div
                className={clsx(styles.noAppsContainer, {
                    [styles.noAppsAnimating]: noApps,
                })}
            >
                <div className={styles.emptyStateText}>
                    <div>
                        <Message
                            key="youDontHaveAnyApplication"
                            defaultMessage="You don't have any app registered yet."
                        />
                    </div>
                    <div>
                        <Message key="shallWeStart" defaultMessage="Shall we start?" />
                    </div>
                </div>

                <LinkButton
                    to="/dev/applications/new"
                    data-e2e="newApp"
                    color={COLOR_GREEN}
                    className={styles.emptyStateActionButton}
                >
                    <Message {...labels.addNew} />
                </LinkButton>
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
                    <Message key="weDontKnowAnythingAboutYou" defaultMessage="We don't know anything about you yet." />
                </div>
                <div>
                    <Message key="youMustAuthToBegin" defaultMessage="You have to authorize to start." />
                </div>
            </div>

            <LinkButton to="/login" color={COLOR_BLUE} className={styles.emptyStateActionButton}>
                <Message key="authorization" defaultMessage="Authorization" />
            </LinkButton>
        </div>
    );
}
