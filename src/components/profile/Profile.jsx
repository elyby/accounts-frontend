import React, { Component } from 'react';

import { FormattedMessage as Message, FormattedRelative as Relative, FormattedHTMLMessage as HTMLMessage } from 'react-intl';
import Helmet from 'react-helmet';

import { userShape } from 'components/user/User';

import ProfileField from './ProfileField';
import styles from './profile.scss';
import messages from './Profile.messages';

export class Profile extends Component {
    static displayName = 'Profile';
    static propTypes = {
        user: userShape
    };

    render() {
        const { user } = this.props;

        return (
            <div className={styles.container}>
                <Message {...messages.accountPreferencesTitle}>
                    {(pageTitle) => (
                        <h2 className={styles.title}>
                            <Helmet title={pageTitle} />
                            {pageTitle}
                        </h2>
                    )}
                </Message>

                <div className={styles.content}>
                    <div className={styles.description}>
                        <Message {...messages.accountDescription} />
                    </div>

                    <div className={styles.options}>
                        <div className={styles.item}>
                            <h3 className={styles.optionsTitle}>
                                <Message {...messages.personalData} />
                            </h3>
                            <p className={styles.optionsDescription}>
                                <Message {...messages.preferencesDescription} />
                            </p>
                        </div>

                        <ProfileField
                            label={<Message {...messages.nickname} />}
                            value={user.username}
                            warningMessage={<Message {...messages.mojangPriorityWarning} />}
                        />

                        <ProfileField
                            label={'E-mail'}
                            value={user.email}
                        />

                        <ProfileField
                            label={<Message {...messages.password} />}
                            value={<Message {...messages.changedAt} values={{
                                at: (<Relative value={user.passwordChangedAt * 1000} />)
                            }} />}
                            warningMessage={user.shouldChangePassword ? (
                                <HTMLMessage {...messages.oldHashingAlgoWarning} />
                            ) : ''}
                        />

                        <ProfileField
                            label={<Message {...messages.twoFactorAuth} />}
                            value={<Message {...messages.disabled} />}
                        />

                        <ProfileField
                            label={'UUID'}
                            value={user.uuid}
                            readonly
                        />
                    </div>
                </div>
            </div>
        );
    }
}
