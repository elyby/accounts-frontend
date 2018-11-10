// @flow
import type { Node } from 'react';
import type { OauthAppResponse } from 'services/api/oauth';
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { SKIN_LIGHT, COLOR_BLACK, COLOR_RED } from 'components/ui';
import { Input, Button } from 'components/ui/form';
import Collapse from 'components/ui/collapse';

import styles from '../applicationsIndex.scss';
import messages from '../ApplicationsIndex.intl.json';

const ACTION_REVOKE_TOKENS = 'revoke-tokens';
const ACTION_RESET_SECRET = 'reset-secret';
const ACTION_DELETE = 'delete';
const actionButtons = [
    {
        type: ACTION_REVOKE_TOKENS,
        label: messages.revokeAllTokens
    },
    {
        type: ACTION_RESET_SECRET,
        label: messages.resetClientSecret
    },
    {
        type: ACTION_DELETE,
        label: messages.delete
    }
];

export default class ApplicationItem extends Component<
    {
        application: OauthAppResponse,
        expand: bool,
        onTileClick: string => void,
        onResetSubmit: (string, bool) => Promise<*>,
        onDeleteSubmit: string => Promise<*>
    },
    {
        selectedAction: ?string,
        isActionPerforming: bool,
        detailsHeight: number,
        translateY: number
    }
> {
    state = {
        selectedAction: null,
        isActionPerforming: false,
        translateY: 0,
        detailsHeight: 0
    };

    actionContainer: ?HTMLDivElement;

    render() {
        const { application: app, expand } = this.props;
        const { selectedAction, translateY } = this.state;

        return (
            <div
                className={classNames(styles.appItemContainer, {
                    [styles.appExpanded]: expand
                })}
                data-e2e="appItem"
                data-e2e-app={app.clientId}
            >
                <div className={styles.appItemTile} onClick={this.onTileToggle}>
                    <div className={styles.appTileTitle}>
                        <div className={styles.appName}>{app.name}</div>
                        <div className={styles.appStats}>
                            Client ID: {app.clientId}
                            {typeof app.countUsers !== 'undefined' && (
                                <span>
                                    {' | '}
                                    <Message
                                        {...messages.countUsers}
                                        values={{
                                            count: app.countUsers
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
                    <div
                        className={styles.appDetailsContainer}
                        style={{ transform: `translateY(-${translateY}px)` }}
                    >
                        <div className={styles.appDetailsInfoField}>
                            <Link
                                to={`/dev/applications/${app.clientId}`}
                                className={styles.editAppLink}
                            >
                                <Message
                                    {...messages.editDescription}
                                    values={{
                                        icon: (
                                            <div
                                                className={styles.pencilIcon}
                                            />
                                        )
                                    }}
                                />
                            </Link>
                            <Input
                                label="Client ID:"
                                skin={SKIN_LIGHT}
                                disabled
                                value={app.clientId}
                                copy
                            />
                        </div>

                        <div className={styles.appDetailsInfoField}>
                            <Input
                                label="Client Secret:"
                                skin={SKIN_LIGHT}
                                disabled
                                value={app.clientSecret}
                                copy
                            />
                        </div>

                        <div className={styles.appDetailsDescription}>
                            <Message
                                {...messages.ifYouSuspectingThatSecretHasBeenCompromised}
                            />
                        </div>

                        <div className={styles.appActionsButtons}>
                            {actionButtons.map(({ type, label }) => (
                                <Button
                                    key={type}
                                    label={label}
                                    color={COLOR_BLACK}
                                    className={styles.appActionButton}
                                    disabled={
                                        selectedAction
                                        && selectedAction !== type
                                    }
                                    onClick={this.onActionButtonClick(type)}
                                    small
                                />
                            ))}
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
                            <Message
                                {...messages.allRefreshTokensWillBecomeInvalid}
                            />{' '}
                            <Message
                                {...messages.takeCareAccessTokensInvalidation}
                            />
                        </div>
                        <div className={styles.appActionsButtons}>
                            <Button
                                label={messages.cancel}
                                color={COLOR_BLACK}
                                className={styles.appActionButton}
                                onClick={this.onActionButtonClick(null)}
                                small
                            />
                            <div className={styles.continueActionButtonWrapper}>
                                {isActionPerforming ? (
                                    <div className={styles.performingAction}>
                                        <Message {...messages.performing} />
                                    </div>
                                ) : (
                                    <div
                                        className={styles.continueActionLink}
                                        onClick={this.onResetSubmit(
                                            selectedAction
                                                === ACTION_RESET_SECRET
                                        )}
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
                            <Message
                                {...messages.appAndAllTokenWillBeDeleted}
                            />{' '}
                            <Message
                                {...messages.takeCareAccessTokensInvalidation}
                            />
                        </div>
                        <div className={styles.appActionsButtons}>
                            <Button
                                label={messages.cancel}
                                color={COLOR_BLACK}
                                className={styles.appActionButton}
                                onClick={this.onActionButtonClick(null)}
                                small
                            />
                            <div className={styles.continueActionButtonWrapper}>
                                {isActionPerforming ? (
                                    <div className={styles.performingAction}>
                                        <Message {...messages.performing} />
                                    </div>
                                ) : (
                                    <Button
                                        label={messages.delete}
                                        color={COLOR_RED}
                                        className={styles.appActionButton}
                                        onClick={this.onSubmitDelete}
                                        small
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    setActiveAction = (type: ?string) => {
        const { actionContainer } = this;

        if (!actionContainer) {
            return;
        }

        this.setState(
            {
                selectedAction: type
            },
            () => {
                const translateY = actionContainer.offsetHeight;

                this.setState({ translateY });
            }
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

    onActionButtonClick = (type: ?string) => () => {
        this.setActiveAction(type === this.state.selectedAction ? null : type);
    };

    onResetSubmit = (resetClientSecret: bool) => async () => {
        const { onResetSubmit, application } = this.props;

        this.setState({
            isActionPerforming: true
        });

        await onResetSubmit(application.clientId, resetClientSecret);

        this.setState({
            isActionPerforming: false
        });
        this.setActiveAction(null);
    };

    onSubmitDelete = () => {
        const { onDeleteSubmit, application } = this.props;

        this.setState({
            isActionPerforming: true
        });

        onDeleteSubmit(application.clientId);
    };
}
