import React, { Component } from 'react';

import { FormattedMessage as Message, FormattedRelative as Relative, FormattedHTMLMessage as HTMLMessage } from 'react-intl';
import Helmet from 'react-helmet';

import { userShape } from 'components/user/User';
import { LangMenu } from 'components/langMenu';
import langMenuMessages from 'components/langMenu/langMenu.intl.json';

import ProfileField from './ProfileField';
import styles from './profile.scss';
import profileForm from './profileForm.scss';
import messages from './Profile.intl.json';

export default class Profile extends Component {
    static displayName = 'Profile';
    static propTypes = {
        user: userShape
    };

    render() {
        const { user } = this.props;

        return (
            <div>
                <Message {...messages.accountPreferencesTitle}>
                    {(pageTitle) => (
                        <h2 className={styles.indexTitle}>
                            <Helmet title={pageTitle} />
                            {pageTitle}
                        </h2>
                    )}
                </Message>

                <div className={styles.indexContent}>
                    <div className={styles.descriptionColumn}>
                        <div className={styles.indexDescription}>
                            <Message {...messages.accountDescription} />
                        </div>
                    </div>

                    <div className={styles.formColumn}>
                        <div className={profileForm.form}>
                            <div className={styles.item}>
                                <h3 className={profileForm.title}>
                                    <Message {...messages.personalData} />
                                </h3>
                                <p className={profileForm.description}>
                                    <Message {...messages.preferencesDescription} />
                                </p>
                            </div>

                            <ProfileField
                                link="/profile/change-username"
                                label={<Message {...messages.nickname} />}
                                value={user.username}
                                warningMessage={user.hasMojangUsernameCollision ? (
                                    <Message {...messages.mojangPriorityWarning} />
                                ) : ''}
                            />

                            <ProfileField
                                link="/profile/change-email"
                                label={'E‑mail'}
                                value={user.email}
                            />

                            <ProfileField
                                link="/profile/change-password"
                                label={<Message {...messages.password} />}
                                value={<Message {...messages.changedAt} values={{
                                    at: (<Relative value={user.passwordChangedAt * 1000} updateInterval={1000} />)
                                }} />}
                                warningMessage={user.shouldChangePassword ? (
                                    <HTMLMessage {...messages.oldHashingAlgoWarning} />
                                ) : ''}
                            />

                            <ProfileField
                                label={<Message {...langMenuMessages.siteLanguage} />}
                                value={<LangMenu showCurrentLang />}
                            />

                            <ProfileField
                                label={<Message {...messages.twoFactorAuth} />}
                                value={<Message {...messages.disabled} />}
                            />

                            <ProfileField
                                label={'UUID'}
                                value={<span className={styles.uuid}>{user.uuid}</span>}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
