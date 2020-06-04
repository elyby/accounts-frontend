import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChangeLanguageLink } from 'app/components/languageSwitcher';
import { RelativeTime } from 'app/components/ui';
import { User } from 'app/components/user';
import RulesPage from 'app/pages/rules/RulesPage';
import { RootState } from 'app/reducers';

import ProfileField from './ProfileField';
import styles from './profile.scss';
import profileForm from './profileForm.scss';

type Props = {
    user: User;
    interfaceLocale: string;
};

class Profile extends React.PureComponent<Props> {
    UUID: HTMLElement | null;

    render() {
        const { user, interfaceLocale } = this.props;

        return (
            <div data-testid="profile-index">
                <Message key="accountPreferencesTitle" defaultMessage="Ely.by account preferences">
                    {(pageTitle: string) => (
                        <h2 className={styles.indexTitle}>
                            <Helmet title={pageTitle} />
                            {pageTitle}
                        </h2>
                    )}
                </Message>

                <div className={styles.indexContent}>
                    <div className={styles.descriptionColumn}>
                        <div className={styles.indexDescription}>
                            <Message
                                key="accountDescription"
                                defaultMessage="Ely.by account allows you to get access to many Minecraft resources. Please, take care of your account safety. Use secure password and change it regularly."
                            />
                        </div>
                    </div>

                    <div className={styles.formColumn}>
                        <div className={profileForm.form}>
                            <div className={styles.item}>
                                <h3 className={profileForm.title}>
                                    <Message key="personalData" defaultMessage="Personal data" />
                                </h3>
                                <p className={profileForm.description}>
                                    <Message
                                        key="preferencesDescription"
                                        defaultMessage="Here you can change the key preferences of your account. Please note that all actions must be confirmed by entering a password."
                                    />
                                </p>
                            </div>

                            <ProfileField
                                link="/profile/change-username"
                                label={<Message key="nickname" defaultMessage="Nickname:" />}
                                value={user.username}
                                warningMessage={
                                    user.hasMojangUsernameCollision ? (
                                        <Message
                                            key="mojangPriorityWarning"
                                            defaultMessage="A Mojang account with the same nickname was found. According to {rules}, account owner has the right to demand the restoration of control over nickname."
                                            values={{
                                                rules: (
                                                    <Link
                                                        to={{
                                                            pathname: '/rules',
                                                            hash: `#${RulesPage.getRuleHash(1, 4)}`,
                                                        }}
                                                    >
                                                        <Message key="projectRules" defaultMessage="project rules" />
                                                    </Link>
                                                ),
                                            }}
                                        />
                                    ) : (
                                        ''
                                    )
                                }
                            />

                            <ProfileField
                                link="/profile/change-email"
                                label={<Message key="email" defaultMessage="E‑mail:" />}
                                value={user.email}
                            />

                            <ProfileField
                                link="/profile/change-password"
                                label={<Message key="password" defaultMessage="Password:" />}
                                value={
                                    <Message
                                        key="changedAt"
                                        defaultMessage="Changed {at}"
                                        values={{
                                            at: <RelativeTime timestamp={user.passwordChangedAt * 1000} />,
                                        }}
                                    />
                                }
                            />

                            <ProfileField
                                label={<Message key="siteLanguage" defaultMessage="Site language:" />}
                                value={<ChangeLanguageLink />}
                                warningMessage={
                                    user.lang === interfaceLocale ? (
                                        ''
                                    ) : (
                                        <Message
                                            key="languageIsUnavailableWarning"
                                            defaultMessage={
                                                'The locale "{locale}" you\'ve used earlier isn\'t currently translated enough. If you want to continue using the selected language, please {participateInTheTranslation} of the project.'
                                            }
                                            values={{
                                                locale: user.lang,
                                                participateInTheTranslation: (
                                                    <a href="http://ely.by/translate" target="_blank">
                                                        <Message
                                                            key="participateInTheTranslation"
                                                            defaultMessage="participate in the translation"
                                                        />
                                                    </a>
                                                ),
                                            }}
                                        />
                                    )
                                }
                            />

                            <ProfileField
                                link="/profile/mfa"
                                label={<Message key="twoFactorAuth" defaultMessage="Two‑factor auth:" />}
                                value={
                                    user.isOtpEnabled ? (
                                        <Message key="enabled" defaultMessage="Enabled" />
                                    ) : (
                                        <Message key="disabled" defaultMessage="Disabled" />
                                    )
                                }
                            />

                            <ProfileField
                                label={<Message key="uuid" defaultMessage="UUID:" />}
                                value={
                                    <span
                                        className={styles.uuid}
                                        ref={this.setUUID.bind(this)}
                                        onMouseOver={this.handleUUIDMouseOver.bind(this)}
                                    >
                                        {user.uuid}
                                    </span>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    handleUUIDMouseOver() {
        if (!this.UUID) {
            return;
        }

        const el = this.UUID;

        try {
            const selection = window.getSelection();

            if (!selection) {
                return;
            }

            const range = document.createRange();
            range.selectNodeContents(el);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (err) {
            // the browser does not support an API
        }
    }

    setUUID(el: HTMLElement | null) {
        this.UUID = el;
    }
}

export default connect(({ user, i18n }: RootState) => ({
    user,
    interfaceLocale: i18n.locale,
}))(Profile);
