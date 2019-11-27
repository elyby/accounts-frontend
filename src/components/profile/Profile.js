// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import { ChangeLanguageLink } from 'components/languageSwitcher';
import { RelativeTime } from 'components/ui';

import ProfileField from './ProfileField';
import styles from './profile.scss';
import profileForm from './profileForm.scss';
import messages from './Profile.intl.json';
import RulesPage from 'pages/rules/RulesPage';

import type { User } from 'components/user';

type OwnProps = {||};

type Props = {
  ...OwnProps,
  user: User,
  interfaceLocale: string,
};

class Profile extends Component<Props> {
  UUID: ?HTMLElement;

  render() {
    const { user, interfaceLocale } = this.props;

    return (
      <div>
        <Message {...messages.accountPreferencesTitle}>
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
                warningMessage={
                  user.hasMojangUsernameCollision ? (
                    <Message
                      {...messages.mojangPriorityWarning}
                      values={{
                        rules: (
                          <Link
                            to={{
                              pathname: '/rules',
                              hash: `#${RulesPage.getRuleHash(1, 4)}`,
                            }}
                          >
                            <Message {...messages.projectRules} />
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
                label={<Message {...messages.email} />}
                value={user.email}
              />

              <ProfileField
                link="/profile/change-password"
                label={<Message {...messages.password} />}
                value={
                  <Message
                    {...messages.changedAt}
                    values={{
                      at: (
                        <RelativeTime
                          timestamp={user.passwordChangedAt * 1000}
                        />
                      ),
                    }}
                  />
                }
              />

              <ProfileField
                label={<Message {...messages.siteLanguage} />}
                value={<ChangeLanguageLink />}
                warningMessage={
                  user.lang === interfaceLocale ? (
                    ''
                  ) : (
                    <Message
                      {...messages.languageIsUnavailableWarning}
                      values={{
                        locale: user.lang,
                        participateInTheTranslation: (
                          <a href="http://ely.by/translate" target="_blank">
                            <Message
                              {...messages.participateInTheTranslation}
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
                label={<Message {...messages.twoFactorAuth} />}
                value={
                  user.isOtpEnabled ? (
                    <Message {...messages.enabled} />
                  ) : (
                    <Message {...messages.disabled} />
                  )
                }
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

  handleUUIDMouseOver() {
    if (!this.UUID) {
      return;
    }

    const el = this.UUID;

    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (err) {
      // the browser does not support an API
    }
  }

  setUUID(el: ?HTMLElement) {
    this.UUID = el;
  }
}

export default connect<Props, OwnProps, _, _, _, _>(({ user, i18n }) => ({
  user,
  interfaceLocale: i18n.locale,
}))(Profile);
