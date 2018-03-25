// @flow
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet';

import styles from './applicationsIndex.scss';
import messages from './ApplicationsIndex.intl.json';
import cubeIcon from './icons/cube.svg';
import loadingCubeIcon from './icons/loading-cube.svg';
import toolsIcon from './icons/tools.svg';

import ApplicationItem from './ApplicationItem';

import { LinkButton } from 'components/ui/form';
import { COLOR_GREEN, COLOR_BLUE } from 'components/ui';
import { restoreScroll } from 'components/ui/scroll/scroll';

import type { Node } from 'react';
import type { OauthAppResponse } from 'services/api/oauth';

type Props = {
    location: {
        hash: string,
    },
    displayForGuest: bool,
    applications: Array<OauthAppResponse>,
    isLoading: bool,
    createContactPopup: () => void,
    deleteApp: (string) => Promise<any>,
    resetApp: (string, bool) => Promise<any>,
};

type State = {
    expandedApp: ?string,
};

class ApplicationsIndex extends Component<Props, State> {
    state = {
        expandedApp: null,
    };

    appsRefs = {};

    componentDidUpdate(prevProps: Props) {
        const { applications, isLoading, location } = this.props;
        if (isLoading !== prevProps.isLoading && applications.length) {
            const hash = location.hash.substr(1);
            if (hash !== '' && applications.some((app) => app.clientId === hash)) {
                requestAnimationFrame(() => this.onTileClick(hash));
            }
        }
    }

    render() {
        const { displayForGuest, applications, isLoading, resetApp, deleteApp } = this.props;
        const { expandedApp } = this.state;

        let content: Node;
        if (displayForGuest) {
            content = (
                <div className={styles.emptyState}>
                    <img src={toolsIcon} className={styles.emptyStateIcon} />
                    <div className={styles.emptyStateText}>
                        <div>
                            <Message {...messages.weDontKnowAnythingAboutYou}/>
                        </div>
                        <div>
                            <Message {...messages.youMustAuthToBegin}/>
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
        } else if (isLoading) {
            content = (
                <div className={styles.emptyState}>
                    <img src={loadingCubeIcon} className={styles.loadingStateIcon} />
                </div>
            );
        } else if (applications.length > 0) {
            content = (
                <div>
                    <div className={styles.appsListTitleContainer}>
                        <div className={styles.appsListTitle}>
                            <Message {...messages.yourApplications} />
                        </div>
                        <LinkButton
                            to="/dev/applications/new"
                            label={messages.addNew}
                            color={COLOR_GREEN}
                            className={styles.appsListAddNewAppBtn}
                        />
                    </div>
                    <div className={styles.appsListContainer}>
                        {applications.map((app: OauthAppResponse) => (
                            <div key={app.clientId} ref={(elem) => {this.appsRefs[app.clientId] = elem;}}>
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
        } else {
            content = (
                <div className={styles.emptyState}>
                    <img src={cubeIcon} className={styles.emptyStateIcon} />
                    <div className={styles.emptyStateText}>
                        <div>
                            <Message {...messages.youDontHaveAnyApplication}/>
                        </div>
                        <div>
                            <Message {...messages.shallWeStart}/>
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

        return (
            <div className={styles.container}>
                <div className={styles.welcomeContainer}>
                    <Message {...messages.accountsForDevelopers} >
                        {(pageTitle: string) => (
                            <h2 className={styles.welcomeTitle}>
                                <Helmet title={pageTitle} />
                                {pageTitle}
                            </h2>
                        )}
                    </Message>
                    <div className={styles.welcomeTitleDelimiter} />
                    <div className={styles.welcomeParagraph}>
                        <Message {...messages.accountsAllowsYouYoUseOauth2} values={{
                            ourDocumentation: (
                                <a href="http://docs.ely.by/oauth.html" target="_blank">
                                    <Message {...messages.ourDocumentation} />
                                </a>
                            ),
                        }} />
                    </div>
                    <div className={styles.welcomeParagraph}>
                        <Message {...messages.ifYouHaveAnyTroubles} values={{
                            feedback: (
                                <a href="#" onClick={this.onContact}>
                                    <Message {...messages.feedback} />
                                </a>
                            ),
                        }} />
                    </div>
                </div>

                {content}
            </div>
        );
    }

    onTileClick = (clientId: string) => {
        const expandedApp = this.state.expandedApp === clientId ? null : clientId;
        this.setState({expandedApp}, () => {
            if (expandedApp !== null) {
                // TODO: @SleepWalker: мб у тебя есть идея, как это сделать более правильно и менее дёргано?
                setTimeout(() => restoreScroll(this.appsRefs[clientId]), 150);
            }
        });
    };

    onContact = (event) => {
        event.preventDefault();
        this.props.createContactPopup();
    };
}

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { create as createPopup } from 'components/ui/popup/actions';
import ContactForm from 'components/contact/ContactForm';

export default withRouter(connect(null, {
    createContactPopup: () => createPopup(ContactForm),
})(ApplicationsIndex));
