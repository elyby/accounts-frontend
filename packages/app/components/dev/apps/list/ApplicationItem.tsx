import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import { SKIN_LIGHT, COLOR_BLACK, COLOR_RED } from 'app/components/ui';
import { Input, Button } from 'app/components/ui/form';
import { OauthAppResponse } from 'app/services/api/oauth';
import Collapse from 'app/components/ui/collapse';

import styles from '../applicationsIndex.scss';
import messages from '../list.intl';

const ACTION_REVOKE_TOKENS = 'revoke-tokens';
const ACTION_RESET_SECRET = 'reset-secret';
const ACTION_DELETE = 'delete';

interface State {
    selectedAction: string | null;
    isActionPerforming: boolean;
    detailsHeight: number;
    translateY: number;
}

export default class ApplicationItem extends React.Component<
    {
        application: OauthAppResponse;
        expand: boolean;
        onTileClick: (clientId: string) => void;
        onResetSubmit: (clientId: string, resetClientSecret: boolean) => Promise<void>;
        onDeleteSubmit: (clientId: string) => Promise<void>;
    },
    State
> {
    state: State = {
        selectedAction: null,
        isActionPerforming: false,
        translateY: 0,
        detailsHeight: 0,
    };

    actionContainer: HTMLDivElement | null;

    render() {
        const { application: app, expand } = this.props;
        const { selectedAction, translateY } = this.state;

        return (
            <div
                className={clsx(styles.appItemContainer, {
                    [styles.appExpanded]: expand,
                })}
                data-e2e="appItem"
                data-e2e-app-name={app.name}
            >
                <div className={styles.appItemTile} onClick={this.onTileToggle}>
                    <div className={styles.appTileTitle}>
                        <div className={styles.appName}>{app.name}</div>
                        <div className={styles.appStats}>
                            {/* TODO: it must change items order for RTL languages, try to use FormattedList */}
                            Client ID: {app.clientId}
                            {'countUsers' in app && (
                                <span>
                                    {' | '}
                                    <Message
                                        {...messages.countUsers}
                                        values={{
                                            count: app.countUsers,
                                        }}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={styles.appItemToggle}>
                        <div className={styles.appItemToggleIcon} />
                    </div>
                </div>

                <Collapse isOpened={expand} onRest={this.onCollapseRest}>
                    <div className={styles.appDetailsContainer} style={{ transform: `translateY(-${translateY}px)` }}>
                        <div className={styles.appDetailsInfoField}>
                            <Link to={`/dev/applications/${app.clientId}`} className={styles.editAppLink}>
                                <Message
                                    {...messages.editDescription}
                                    values={{
                                        icon: <div className={styles.pencilIcon} />,
                                    }}
                                />
                            </Link>
                            <Input label="Client ID:" skin={SKIN_LIGHT} disabled value={app.clientId} copy />
                        </div>

                        {'clientSecret' in app ? (
                            <>
                                <div className={styles.appDetailsInfoField}>
                                    <Input
                                        label="Client Secret:"
                                        skin={SKIN_LIGHT}
                                        disabled
                                        value={app.clientSecret}
                                        data-testid="client-secret"
                                        copy
                                    />
                                </div>

                                <div className={styles.appDetailsDescription}>
                                    <Message {...messages.ifYouSuspectingThatSecretHasBeenCompromised} />
                                </div>
                            </>
                        ) : (
                            <div className={styles.appDetailsDescription}>
                                <Message
                                    key="publickOauthApplicationDescription"
                                    defaultMessage="This is a public client and it can't have any secrets by design. To secure authorization flow, use the PKCE challenge code. <link>Read more</link>."
                                    values={{
                                        // @ts-expect-error those typings seems to be invalid in the current version of react-intl, but might be fixed later
                                        link: (nodes) => (
                                            <a href="https://www.oauth.com/oauth2-servers/pkce/" target="_blank">
                                                {nodes}
                                            </a>
                                        ),
                                    }}
                                />
                            </div>
                        )}

                        <div className={styles.appActionsButtons}>
                            <Button
                                color={COLOR_BLACK}
                                className={styles.appActionButton}
                                disabled={!!selectedAction && selectedAction !== ACTION_REVOKE_TOKENS}
                                onClick={this.onActionButtonClick(ACTION_REVOKE_TOKENS)}
                                small
                            >
                                <Message {...messages.revokeAllTokens} />
                            </Button>

                            {'clientSecret' in app && (
                                <Button
                                    color={COLOR_BLACK}
                                    className={styles.appActionButton}
                                    disabled={!!selectedAction && selectedAction !== ACTION_RESET_SECRET}
                                    onClick={this.onActionButtonClick(ACTION_RESET_SECRET)}
                                    small
                                >
                                    <Message {...messages.resetClientSecret} />
                                </Button>
                            )}

                            <Button
                                color={COLOR_BLACK}
                                className={styles.appActionButton}
                                disabled={!!selectedAction && selectedAction !== ACTION_DELETE}
                                onClick={this.onActionButtonClick(ACTION_DELETE)}
                                small
                            >
                                <Message {...messages.delete} />
                            </Button>
                        </div>

                        <div
                            className={styles.appActionContainer}
                            ref={(el) => {
                                this.actionContainer = el;
                            }}
                        >
                            {this.getActionContent()}
                        </div>
                    </div>
                </Collapse>
            </div>
        );
    }

    getActionContent() {
        const { selectedAction, isActionPerforming } = this.state;

        switch (selectedAction) {
            case ACTION_REVOKE_TOKENS:
            case ACTION_RESET_SECRET:
                return (
                    <div>
                        <div className={styles.appActionDescription}>
                            <Message {...messages.allRefreshTokensWillBecomeInvalid} />{' '}
                            <Message {...messages.takeCareAccessTokensInvalidation} />
                        </div>
                        <div className={styles.appActionsButtons}>
                            <Button
                                color={COLOR_BLACK}
                                className={styles.appActionButton}
                                onClick={this.onActionButtonClick(null)}
                                small
                            >
                                <Message {...messages.cancel} />
                            </Button>
                            <div className={styles.continueActionButtonWrapper}>
                                {isActionPerforming ? (
                                    <div className={styles.performingAction}>
                                        <Message {...messages.performing} />
                                    </div>
                                ) : (
                                    <div
                                        className={styles.continueActionLink}
                                        onClick={this.onResetSubmit(selectedAction === ACTION_RESET_SECRET)}
                                    >
                                        <Message {...messages.continue} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case ACTION_DELETE:
                return (
                    <div>
                        <div className={styles.appActionDescription}>
                            <Message {...messages.appAndAllTokenWillBeDeleted} />{' '}
                            <Message {...messages.takeCareAccessTokensInvalidation} />
                        </div>
                        <div className={styles.appActionsButtons}>
                            <Button
                                color={COLOR_BLACK}
                                className={styles.appActionButton}
                                onClick={this.onActionButtonClick(null)}
                                small
                            >
                                <Message {...messages.cancel} />
                            </Button>
                            <div className={styles.continueActionButtonWrapper}>
                                {isActionPerforming ? (
                                    <div className={styles.performingAction}>
                                        <Message {...messages.performing} />
                                    </div>
                                ) : (
                                    <Button
                                        color={COLOR_RED}
                                        className={styles.appActionButton}
                                        onClick={this.onSubmitDelete}
                                        data-testid="delete-app"
                                        small
                                    >
                                        <Message {...messages.delete} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    setActiveAction = (type: string | null) => {
        const { actionContainer } = this;

        if (!actionContainer) {
            return;
        }

        this.setState(
            {
                selectedAction: type,
            },
            () => {
                const translateY = actionContainer.offsetHeight;

                this.setState({ translateY });
            },
        );
    };

    onTileToggle = () => {
        const { onTileClick, application } = this.props;

        onTileClick(application.clientId);
    };

    onCollapseRest = () => {
        if (!this.props.expand && this.state.selectedAction) {
            this.setActiveAction(null);
        }
    };

    onActionButtonClick = (type: string | null) => () => {
        this.setActiveAction(type === this.state.selectedAction ? null : type);
    };

    onResetSubmit = (resetClientSecret: boolean) => async () => {
        const { onResetSubmit, application } = this.props;

        this.setState({
            isActionPerforming: true,
        });

        await onResetSubmit(application.clientId, resetClientSecret);

        this.setState({
            isActionPerforming: false,
        });
        this.setActiveAction(null);
    };

    onSubmitDelete = () => {
        const { onDeleteSubmit, application } = this.props;

        this.setState({
            isActionPerforming: true,
        });

        onDeleteSubmit(application.clientId);
    };
}
