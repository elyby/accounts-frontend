import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage as Message, FormattedRelative as Relative } from 'react-intl';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';

import { requireLocaleFlag } from 'functions';
import LANGS from 'i18n/index.json';

import { userShape } from 'components/user/User';

import ProfileField from './ProfileField';
import styles from './profile.scss';
import profileForm from './profileForm.scss';
import messages from './Profile.intl.json';

import RulesPage from 'pages/rules/RulesPage';

class Profile extends Component {
    static displayName = 'Profile';
    static propTypes = {
        user: userShape,
        createLanguageSwitcherPopup: PropTypes.func.isRequired,
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
                                    <Message {...messages.mojangPriorityWarning} values={{
                                        rules: (
                                            <Link to={{
                                                pathname: '/rules',
                                                hash: `#${RulesPage.getRuleHash(1, 4)}`
                                            }}>
                                                <Message {...messages.projectRules} />
                                            </Link>
                                        )
                                    }} />
                                ) : ''}
                            />

                            <ProfileField
                                link="/profile/change-email"
                                label={<Message {...messages.email} />}
                                value={user.email}
                            />

                            <ProfileField
                                link="/profile/change-password"
                                label={<Message {...messages.password} />}
                                value={<Message {...messages.changedAt} values={{
                                    at: (<Relative value={user.passwordChangedAt * 1000} updateInterval={1000} />)
                                }} />}
                            />

                            <ProfileField
                                label={<Message {...messages.siteLanguage} />}
                                value={
                                    <span className={styles.language} onClick={this.onLanguageSwitcher.bind(this)}>
                                        <span className={styles.languageIcon} style={{
                                            backgroundImage: `url('${requireLocaleFlag(user.lang)}')`
                                        }} />
                                        {LANGS[user.lang].name}
                                    </span>
                                }
                            />

                            <ProfileField
                                link="/profile/mfa"
                                label={<Message {...messages.twoFactorAuth} />}
                                value={user.isOtpEnabled ? (
                                    <Message {...messages.enabled} />
                                ) : (
                                    <Message {...messages.disabled} />
                                )}
                            />

                            <ProfileField
                                label={<Message {...messages.uuid} />}
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

    onLanguageSwitcher() {
        this.props.createLanguageSwitcherPopup();
    }

    handleUUIDMouseOver() {
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this.UUID);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (err) {
            // the browser does not support an API
        }
    }

    setUUID(el) {
        this.UUID = el;
    }
}

import { connect } from 'react-redux';
import LanguageSwitcher from 'components/languageSwitcher/LanguageSwitcher';
import { create as createPopup } from 'components/ui/popup/actions';

export default connect((state) => ({
    user: state.user,
}), {
    createLanguageSwitcherPopup: () => createPopup(LanguageSwitcher),
})(Profile);
